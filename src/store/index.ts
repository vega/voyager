import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';

import {DEFAULT_STATE} from '../models';
import {rootReducer} from '../reducers';

export function configureStore(initialState = DEFAULT_STATE) {
  const store = createStore(
    rootReducer,
    {past: [], present: initialState, future: []},
    applyMiddleware(thunkMiddleware)
  );
  return store;
}
