import {Action} from '../actions';
import {State} from '../models';

import {shelfReducer} from './shelf';

export function rootReducer(state: Readonly<State>, action: Action): State {
  return {
    shelf: shelfReducer(state.shelf, action)
  };
}
