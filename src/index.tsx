import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'font-awesome-sass-loader';

import {App} from './components/app';
import {configureStore} from './store';

const store = configureStore();

const data = 'node_modules/vega-datasets/cars.json';
const config = {};

ReactDOM.render(
    <Provider store={store}>
        <App
          data={data}
          config={config}
        />
    </Provider>,
    document.getElementById('root')
);
