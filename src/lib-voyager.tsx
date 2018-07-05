// This module is intended to be used when embedding voyager
// in some other context than the orgiginal app.
//
// It provides factory methods for creating instances of the Voyager application
// and should eventually also export a react component if one is doing that kind
// of integration.

import * as Ajv from 'ajv';
import * as draft4Schemas from 'ajv/lib/refs/json-schema-draft-04.json';
import 'font-awesome-sass-loader'; // TODO should this move to App?
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Store} from 'redux';
import {TopLevelSpec} from 'vega-lite';
import {Data} from 'vega-lite/build/src/data';
import {FacetedCompositeUnitSpec, isUnitSpec, TopLevel} from 'vega-lite/build/src/spec';
import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';
import {isString} from 'vega-util';
import { REDO, UNDO } from './actions/index';
import {App} from './components/app';
import {State} from './models';
import {DEFAULT_VOYAGER_CONFIG, VoyagerConfig} from './models/config';
import {fromSerializable, SerializableState, toSerializable} from './models/index';
import {selectData} from './selectors/dataset';
import {selectBookmark} from './selectors/index';
import {selectMainSpec} from './selectors/result';
import {configureStore} from './store';



export type Container = string | HTMLElement;

/**
 * The Voyager class encapsulates the voyager application and allows for easy
 * instantiation and interaction from non-react projects.
 */
export class Voyager {
  private container: HTMLElement;
  private config: VoyagerConfig;
  private store: Store<State>;
  private data: Data;
  private filename: string;

  constructor(container: Container, config: VoyagerConfig, data: Data) {
    if (isString(container)) {
      this.container = document.querySelector(container) as HTMLElement;
      // TODO throw error if not found
    } else {
      this.container = container;
    }

    this.config = {
      ...DEFAULT_VOYAGER_CONFIG,
      ...config
    };
    this.data = data;
    this.init();
  }

  /**
   * Update the dataset currently loaded into voyager
   *
   * @param {VoyagerData} data
   *
   * @memberof Voyager
   */
  public updateData(data: Data) {
    this.data = data;
    this.render();
  }

  /**
   * Update state to reflect the previous state
   *
   * @memberof Voyager
   */
  public undo(): void {
    this.store.dispatch({type: UNDO});
    this.render();
  }

  /**
   * Update state to reflect the future state
   *
   * @memberof Voyager
   */
  public redo(): void {
    this.store.dispatch({type: REDO});
    this.render();
  }
  /**
   * Update the configuration of the voyager application.
   *
   * @param {VoyagerConfig} config
   *
   * @memberof Voyager
   */
  public updateConfig(config: VoyagerConfig) {
    this.config = config;
    this.render();
  }

  public setFilename(filename: string) {
    this.filename = filename;
  }

  /**
   * Apply a vega-lite spec to voyager.
   *
   * @param {VoyagerConfig} config
   *
   * @memberof Voyager
   */
  public setSpec(spec: Object) {

    const ajv = new Ajv({
      validateSchema: true,
      allErrors: true,
      extendRefs: 'fail'
    });
    ajv.addMetaSchema(draft4Schemas, 'http://json-schema.org/draft-04/schema#');

    const validateVl = ajv.compile(vlSchema);
    const valid = validateVl(spec);

    if (!valid) {
      throw new Error("Invalid spec:" + validateVl.errors.toString());
    }

    // If it is validated, it is a TopLevelExtendedSpec
    if (!isUnitSpec(spec as TopLevelSpec)) {
      throw new Error("Voyager does not support layered or multi-view vega-lite specs");
    }

    // If it is unit, then we can cast to a top level unit spec
    const validSpec: TopLevel<FacetedCompositeUnitSpec> = spec as TopLevel<FacetedCompositeUnitSpec>;

    this.data = validSpec.data;
    this.render(validSpec);
  }

  /**
   * Sets the entire voyager application state. This is useful for restoring
   * the state of the application to a previosly saved state.
   *
   * @param state A State object with the following keys
   *
   * @param state.config
   * @param state.dataset
   * @param state.shelf
   * @param state.result
   *
   * @memberof Voyager
   */
  public setApplicationState(state: SerializableState): void {
    this.data = undefined;
    this.config = undefined;

    this.renderFromState(fromSerializable(state));
  }

  /**
   *
   * Gets the current application state.
   *
   * @returns {Readonly<State>}
   *
   * @memberof Voyager
   */
  public getApplicationState(): SerializableState {
    return toSerializable(this.store.getState());
  }

  /**
   *
   * Gets Vega-Lite spec of current specified view
   *
   * @returns {Readonly<Spec>}
   *
   * @memberof Voyager
   */
  public getSpec(includeData: boolean): FacetedCompositeUnitSpec {
    const spec = selectMainSpec(this.store.getState());
    if (includeData) {
      return {
        ...spec,
        data: selectData(this.store.getState()),
      };
    }

    return spec;
  }

  /**
   *
   * Gets the current bookmarked vega-lite specs.
   *
   * @returns {string[]}
   *
   * @memberof Voyager
   */
  public getBookmarkedSpecs(): string[] {
    return selectBookmark(this.store.getState()).list;
  }

  /**
   * Subscribe to state changes.
   *
   * This is useful for taking state snapshots to persist and later restore.
   *
   * @param {Function} onChange callback that takes a single state parameter.
   * @returns {Function} unsubscribe, call this function to remove this listener.
   *
   * @memberof Voyager
   */
  public onStateChange(onChange: (state: SerializableState) => void): Function {
    let currentState: State;

    const handleChange = () => {
      const nextState = this.store.getState();
      if (nextState !== currentState) {
        currentState = nextState;
        onChange(toSerializable(currentState));
      }
    };

    const unsubscribe = this.store.subscribe(handleChange);
    return unsubscribe;
  }

  /**
   * Initialized the application, and renders it into the target container
   *
   * @private
   *
   * @memberof Voyager
   */
  private init() {
    this.store = configureStore();
    this.render();
  }

  private render(spec?: TopLevel<FacetedCompositeUnitSpec>) {
    const store = this.store;
    const root = this.container;
    ReactDOM.render(
      <Provider store={store}>
        <App
          dispatch={store.dispatch}
          data={this.data}
          config={this.config}
          spec={spec}
          filename={this.filename}
        />
      </Provider>,
      root
    );
  }

  private renderFromState(state: Readonly<State>) {
    const store = this.store;
    const root = this.container;
    ReactDOM.render(
      <Provider store={store}>
        <App
          dispatch={store.dispatch}
          applicationState={state}
        />
      </Provider>,
      root
    );
  }

}

/**
 * Create an instance of the voyager application.
 *
 * @param {Container} container css selector or HTMLElement that will be the parent
 *                              element of the application
 * @param {Object}    config    configuration options
 * @param {Array}     data      data object. Can be a string or an array of objects.
 */
export function CreateVoyager(container: Container, config: VoyagerConfig, data: Data): Voyager {
  return new Voyager(container, config, data);
}
