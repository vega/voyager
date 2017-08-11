import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'font-awesome-sass-loader';
import {App, VoyagerData} from './components/app';
import { VOYAGER_CONFIG } from './constants';
import { VoyagerConfig } from './models/config';
import { configureStore } from './store';

const store = configureStore();
const config: VoyagerConfig = VOYAGER_CONFIG;

const data: VoyagerData = undefined;

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
