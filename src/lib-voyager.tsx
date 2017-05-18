// This module is intended to be used when embedding voyager
// in some other context than the orgiginal app.
//
// It provides factory methods for creating instances of the Voyager application
// and should eventually also export a react component if one is doing that kind
// of integration.

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'font-awesome-sass-loader'; // TODO should this move to App?
import {isString} from 'vega-lite/build/src/util';
import {App, VoyagerConfig, VoyagerData} from './components/app';
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
  private store: any; // TODO how to get the type/inteface for this here?

  constructor(container: Container, config: VoyagerConfig, data: VoyagerData) {
    if (isString(container)) {
      this.container = document.querySelector(container) as HTMLElement;
      // TODO throw error if not found
    } else {
      this.container = container;
    }
    this.init();
  }



  public updateData(data: VoyagerData) {
    this.data = data;
    this.render(data, this.config);
  }

  public updateConfig(config: VoyagerConfig) {
    this.config = config;
    this.render(this.data, config);
  }

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
 * Currently a very thin wrapper around the constructor. It may end up that the
 * factory function isn't worth it, but it may provide some useful abstraction
 * as to how one os acutally created.
 * @param {Container} container css selector or HTMLElement that will be the parent
 *                              element of the application
 * @param {Object}    config    [description]
 * @param {Array}     data      [description]
 */
export function CreateVoyager(container: Container, config: Object, data: VoyagerData) {
  return new Voyager(container, config, data);
}
