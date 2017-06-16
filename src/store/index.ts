import {applyMiddleware, compose, createStore, Middleware} from 'redux';
import {createLogger} from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import {StateWithHistory} from 'redux-undo';

import { DEFAULT_STATE, StateBase } from '../models';
import {rootReducer} from '../reducers';


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
  const initialStateWithHistory: StateWithHistory<Readonly<StateBase>> = {
    past: [],
    present: initialState,
    future: [],
    _latestUnfiltered: null,
    group: null,
  };

  const store = createStore(
    rootReducer,
    initialStateWithHistory,
    composeEnhancers(applyMiddleware(...middleware))
  );
  return store;
}
