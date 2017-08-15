import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'font-awesome-sass-loader';

import { Data } from 'vega-lite/build/src/data';
import {App} from './components/app';
import { VOYAGER_CONFIG } from './constants';
import { VoyagerConfig } from './models/config';
import { configureStore } from './store';

const store = configureStore();
const config: VoyagerConfig = VOYAGER_CONFIG;

const data: Data = undefined;

ReactDOM.render(
    <Provider store={store}>
        <App
            config={config}
            data={data}
            dispatch={store.dispatch}
        />
    </Provider>,
    document.getElementById('root')
);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./components/app', () => {
    const NextApp = require('./components/app').App;
    ReactDOM.render(
      <Provider store={store}>
        <NextApp
          config={config}
          data={data}
          dispatch={store.dispatch}
        />
      </Provider>,
      document.getElementById('root')
    );
  });
}
