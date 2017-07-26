import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'font-awesome-sass-loader';

import { Data } from 'vega-lite/build/src/data';
import { App } from './components/app';
import { VOYAGER_CONFIG } from './constants';
import { VoyagerConfig } from './models/config';
import { configureStore } from './store';

const store = configureStore();
const config: VoyagerConfig = VOYAGER_CONFIG;

const data: Data = {
  values: [
    {date: "24-Apr-07", close: "93.24"},
    {date: "25-Apr-07", close: "95.35"},
    {date: "26-Apr-07", close: "98.84"},
    {date: "27-Apr-07", close: "99.92"},
  ]
};

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
