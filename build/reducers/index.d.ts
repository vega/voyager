import { Action } from '../actions';
import { ActionType } from '../actions';
import { State } from '../models/index';
/**
 * Exclude these actions from the history completely.
 */
export declare const ACTIONS_EXCLUDED_FROM_HISTORY: ActionType[];
/**
 * A list of actions that can be initiated by a user.
 *
 * Each of these will start a new 'undo group'. Non-user actions will be put into the group
 * of the preceding user action if one is available. If none is available it will be put
 * into its own group.
 */
export declare const USER_ACTIONS: ActionType[];
export declare const USER_ACTION_INDEX: Object;
/**
 * Actions that are to be grouped with actions that precede them. (Usually for async actions.)
 */
export declare const GROUPED_ACTIONS: ActionType[];
export declare function rootReducer(state: Readonly<State>, action: Action): State;
