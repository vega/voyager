import {applyMiddleware, compose, createStore, Middleware} from 'redux';
import {createLogger} from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

import {DEFAULT_STATE, State} from '../models';
import {rootReducer} from '../reducers';

// Imports to satisfy --declarations build requirements
// https://github.com/Microsoft/TypeScript/issues/9944
// tslint:disable-next-line:no-unused-variable
import {Store} from 'redux';
import undoable from 'redux-undo';
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


export function configureStore(initialState = DEFAULT_STATE) {
  const initialStateWithHistory: State = {
    persistent: initialState.persistent,
    undoable: {
      past: [],
      present: initialState.undoable.present,
      future: [],
      _latestUnfiltered: null,
      group: null,
    }
  };

  const store = createStore<State>(
    rootReducer,
    initialStateWithHistory,
    composeEnhancers(applyMiddleware(...middleware))
  );
  store.subscribe(createQueryListener(store));
  return store;
}
