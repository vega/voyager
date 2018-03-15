import { Action } from '../actions';
import { Reducer } from 'redux';
import { GenericState } from '../models';
import { ActionType } from '../actions';
import { PersistentState, State, UndoableStateBase } from '../models/index';
import { ResetIndex } from './reset';
export declare const persistentReducer: Reducer<PersistentState>;
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
/**
 * Whether to reset a particular property of the undoable state during RESET action
 */
export declare const undoableStateToReset: ResetIndex<UndoableStateBase>;
export declare const undoableReducerBase: Reducer<Readonly<UndoableStateBase>>;
export declare function rootReducer(state: Readonly<State>, action: Action): GenericState<UndoableStateBase>;
