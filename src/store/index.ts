import {createStore} from 'redux';

import {DEFAULT_STATE} from '../models';
import {rootReducer} from '../reducers';

export function configureStore(initialState = DEFAULT_STATE) {
  const store = createStore(rootReducer, initialState);
  return store;
}
