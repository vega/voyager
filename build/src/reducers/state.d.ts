import { Action } from '../actions';
import { StateBase } from '../models/index';
/**
 * Reducer used to set the _entire_ application state tree.
 *
 * @export
 * @param {Readonly<StateBase>} state
 * @param {Action} action
 * @returns {Readonly<StateBase>}
 */
export declare function stateReducer(state: Readonly<StateBase>, action: Action): Readonly<StateBase>;
