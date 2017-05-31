import {applyMiddleware, compose, createStore, Middleware} from 'redux';
import {createLogger} from 'redux-logger';
import thunkMiddleware from 'redux-thunk';

import {DEFAULT_STATE} from '../models';
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
  const store = createStore(
    rootReducer,
    {past: [], present: initialState, future: []},
    composeEnhancers(applyMiddleware(...middleware))
  );
  return store;
}
