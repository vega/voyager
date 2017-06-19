import {
  Action,
  SET_APPLICATION_STATE,
} from '../actions';
import {DEFAULT_STATE, StateBase} from '../models/index';

/**
 * Reducer used to set the _entire_ application state tree.
 *
 * @export
 * @param {Readonly<StateBase>} state
 * @param {Action} action
 * @returns {Readonly<StateBase>}
 */
export function stateReducer(state: Readonly<StateBase> = DEFAULT_STATE, action: Action): Readonly<StateBase> {
  switch (action.type) {
    case SET_APPLICATION_STATE:
      return action.payload.state;
  }
  return state;
}

