// Imports to satisfy --declarations build requirements
// https://github.com/Microsoft/TypeScript/issues/9944
// tslint:disable:no-unused-variable
import {Store} from 'redux';
import {GenericState, UndoableStateBase} from '../models/index';
// tslint:enable:no-unused-variable

import {applyMiddleware, compose, createStore, Middleware, StoreEnhancer} from 'redux';
import {createActionLog} from 'redux-action-log';
import {createLogger} from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import {DEFAULT_STATE, State} from '../models';
import {rootReducer} from '../reducers';
import {createQueryListener} from './listener';

const loggerMiddleware = createLogger({
  collapsed: true,
  level: 'debug'
});

// define which middleware to use depending on environment
let composeEnhancers = compose;
const middleware: Middleware[] = [thunkMiddleware];

// when not in production enable redux tools and add logger middleware
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  composeEnhancers =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  middleware.push(loggerMiddleware);
}

export let actionLogs: any;
export function configureStore(initialState = DEFAULT_STATE) {
  actionLogs = createActionLog({limit: null});

  const store: Store<State> = createStore<State>(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middleware), actionLogs.enhancer) as StoreEnhancer<any>
    // HACK: cast to any to supress typescript complaint
  );


  if (module.hot) {
    // Enable webpack hot module replacement for reducers
    module.hot.accept(
      '../reducers', () => {
        const nextRootReducer = require('../reducers').rootReducer;
        store.replaceReducer(nextRootReducer);
      }
    );
  }

  store.subscribe(createQueryListener(store));
  return store;
}
