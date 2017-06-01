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
import {App, VoyagerConfig, VoyagerData} from './components/app';
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
