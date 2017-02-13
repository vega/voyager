import {Action} from '../actions';
import {State} from '../models';

import {dataReducer} from './data';
import {shelfReducer} from './shelf';

export function rootReducer(state: Readonly<State>, action: Action): State {
  return {
    data: dataReducer(state.data, action),
    shelf: shelfReducer(state.shelf, action)
  };
}
