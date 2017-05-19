import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'font-awesome-sass-loader';

import { Data } from 'vega-lite/build/src/data';
import { App } from './components/app';
import { configureStore } from './store';

const store = configureStore();
const config = {};
const data: Data = {
    values: [
        {"a": "A","b": 28}, {"a": "B","b": 55}, {"a": "C","b": 43},
        {"a": "D","b": 91}, {"a": "E","b": 81}, {"a": "F","b": 53},
        {"a": "G","b": 19}, {"a": "H","b": 87}, {"a": "I","b": 52}
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
