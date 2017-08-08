import {
  Action,
  SET_APPLICATION_STATE,
} from '../actions';
import {DEFAULT_STATE, State} from '../models/index';

/**
 * Reducer used to set the _entire_ application state tree.
 *
 * @export
 * @param {Readonly<State>} state
 * @param {Action} action
 * @returns {Readonly<State>}
 */
export function stateReducer(state: Readonly<State> = DEFAULT_STATE, action: Action): Readonly<State> {
  switch (action.type) {
    case SET_APPLICATION_STATE:
      return action.payload.state;
  }
  return state;
}

