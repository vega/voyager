import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'font-awesome-sass-loader';

import { Data } from 'vega-lite/build/src/data';
import { App } from './components/app';
import { configureStore } from './store';

const store = configureStore();
const config = {};
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
