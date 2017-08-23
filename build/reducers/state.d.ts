import { Action } from '../actions';
import { State } from '../models/index';
/**
 * Reducer used to set the _entire_ application state tree.
 *
 * @export
 * @param {Readonly<State>} state
 * @param {Action} action
 * @returns {Readonly<State>}
 */
export declare function stateReducer(state: Readonly<State>, action: Action): Readonly<State>;
