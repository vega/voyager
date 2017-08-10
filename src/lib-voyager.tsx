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
import { Provider } from 'react-redux';
import {Store} from 'redux';
import {FacetedCompositeUnitSpec, isUnitSpec, TopLevel, TopLevelExtendedSpec} from 'vega-lite/build/src/spec';
import {isString} from 'vega-lite/build/src/util';
import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';
import {App, SpecWithFilename, VoyagerData} from './components/app';
import {State} from './models';
import {VoyagerConfig} from './models/config';
import {fromSerializable, SerializableState, toSerializable} from './models/index';
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
  private data: VoyagerData;

  constructor(container: Container, config: VoyagerConfig, data: VoyagerData) {
    if (isString(container)) {
      this.container = document.querySelector(container) as HTMLElement;
      // TODO throw error if not found
    } else {
      this.container = container;
    }

    this.config = config;
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
  public updateData(data: VoyagerData) {
    this.data = data;
    this.render(data, this.config);
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
    this.render(this.data, config);
  }

  /**
   * Apply a vega-lite spec to voyager.
   *
   * @param {VoyagerConfig} config
   *
   * @memberof Voyager
   */
  public setSpec(specWithFilename: SpecWithFilename) {
    const {spec, filename} = specWithFilename;

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
    if (!isUnitSpec(spec as TopLevelExtendedSpec)) {
      throw new Error("Voyager does not support layered or multi-view vega-lite specs");
    }

    // If it is unit, then we can cast to a top level unit spec
    const validSpec: TopLevel<FacetedCompositeUnitSpec> = spec as TopLevel<FacetedCompositeUnitSpec>;

    this.data = {
      data: validSpec.data,
      filename: 'Custom Data'
    };

    const validSpecWithFilename = {
      spec: validSpec,
      filename
    };

    this.render(this.data, this.config, validSpecWithFilename);
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
    this.render(this.data, this.config);
  }

  private render(data: VoyagerData, config: VoyagerConfig, spec?: SpecWithFilename) {
    const store = this.store;
    const root = this.container;

    ReactDOM.render(
      <Provider store={store}>
        <App
          dispatch={store.dispatch}
          data={data}
          config={config}
          spec={spec}
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
 * @param {Array}     data      VoyagerData object. Contains property `data`,
 *                              a string or an array of objects, and property `filename`, a string.
 */
export function CreateVoyager(container: Container, config: Object, data: VoyagerData): Voyager {
  return new Voyager(container, config, data);
}
