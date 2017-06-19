// This module is intended to be used when embedding voyager
// in some other context than the orgiginal app.
//
// It provides factory methods for creating instances of the Voyager application
// and should eventually also export a react component if one is doing that kind
// of integration.

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {Store} from 'redux';

import 'font-awesome-sass-loader'; // TODO should this move to App?
import {StateWithHistory} from 'redux-undo';
import {isString} from 'vega-lite/build/src/util';
import {App, VoyagerData} from './components/app';
import {VoyagerConfig} from './models/config';
import {StateBase} from './models/index';
import {configureStore} from './store';

type Container = string | HTMLElement;


/**
 * The Voyager class encapsulates the voyager application and allows for easy
 * instantiation and interaction from non-react projects.
 */
class Voyager {
  private container: HTMLElement;
  private config: VoyagerConfig;
  private data: VoyagerData;
  private store: Store<StateWithHistory<Readonly<StateBase>>>;

  constructor(container: Container, config: VoyagerConfig, data: VoyagerData) {
    if (isString(container)) {
      this.container = document.querySelector(container) as HTMLElement;
      // TODO throw error if not found
    } else {
      this.container = container;
    }
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
   * Sets the entire voyager application state. This is useful for restoring
   * the state of the application to a previosly saved state.
   *
   * @param state A StateBase object with the following keys
   *
   * @param state.config
   * @param state.dataset
   * @param state.shelf
   * @param state.result
   *
   * @memberof Voyager
   */
  public setApplicationState(state: Readonly<StateBase>): void {
    this.data = undefined;
    this.config = undefined;

    this.renderFromState(state);
  }

  /**
   *
   * Gets the current application state.
   *
   * @returns {Readonly<StateBase>}
   *
   * @memberof Voyager
   */
  public getApplicationState(): Readonly<StateBase> {
    return this.store.getState().present;
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
  public onStateChange(onChange: Function): Function {
    let currentState: any;

    const handleChange = () => {
      const nextState = this.store.getState();
      if (nextState !== currentState) {
        currentState = nextState;
        onChange(currentState.present);
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

  private render(data: VoyagerData, config: VoyagerConfig) {
    const store = this.store;
    const root = this.container;
    ReactDOM.render(
      <Provider store={store}>
        <App
          dispatch={store.dispatch}
          data={data}
          config={config}
        />
      </Provider>,
      root
    );
  }

  private renderFromState(state: Readonly<StateBase>) {
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
export function CreateVoyager(container: Container, config: Object, data: VoyagerData): Voyager {
  return new Voyager(container, config, data);
}
