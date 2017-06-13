import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'font-awesome-sass-loader';

import { Data } from 'vega-lite/build/src/data';
import { App } from './components/app';
import { VoyagerConfig } from './models/config';
import { configureStore } from './store';

const store = configureStore();
const config: VoyagerConfig = {
  showDataSourceSelector: true
};
const data: Data = undefined;

// These two values would come from a module that would be responsible for
// defining a persistence strategy (getState and saveState basically).

let initialState = undefined;
let onStateChange = undefined;

// Something along these lines is done. we may provide a custom function if we want to filter
// the state before it goes to the callback.
store.subscribe(onStateChange);

ReactDOM.render(
    <Provider store={store}>
        <App
            config={config}
            data={data}
            dispatch={store.dispatch}
            state={initialState}
        />
    </Provider>,
    document.getElementById('root')
);
