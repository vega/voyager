import { StateWithHistory } from 'redux-undo';
import { StateBase } from '../models';
import { Action as BaseReduxAction } from 'redux';
import { ActionType } from '../actions';
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
 * Actions that are to be grouped with actions that precede them.
 *
 * This list is here for documentation purposes
 *
 * DATASET_INLINE_RECEIVE,
 * DATASET_URL_RECEIVE,
 */
export declare const GROUPED_ACTIONS: ActionType[];
export declare const rootReducer: <A extends BaseReduxAction>(state: StateWithHistory<Readonly<StateBase>>, action: A) => StateWithHistory<Readonly<StateBase>>;
