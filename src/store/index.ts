import {createStore} from 'redux';
import {} from 'redux-undo';

import {DEFAULT_STATE} from '../models';
import {rootReducer} from '../reducers';

export function configureStore(initialState = DEFAULT_STATE) {
  const store = createStore(rootReducer, {past: [], present: initialState, future: []});
  return store;
}
