import undoable, {excludeAction, StateWithHistory} from 'redux-undo';
import {toSet} from 'vega-util';

import {Action, REDO, UNDO} from '../actions';
import {HISTORY_LIMIT} from '../constants';
import {DEFAULT_STATE} from '../models';

import {SET_CONFIG} from '../actions/config';

// tslint:disable-next-line:no-unused-variable
import {Action as BaseReduxAction, combineReducers, Reducer} from 'redux';

import {
  BOOKMARK_ADD_PLOT,
  BOOKMARK_CLEAR_ALL,
  BOOKMARK_MODIFY_NOTE,
  BOOKMARK_REMOVE_PLOT,
  DATASET_RECEIVE,
  DATASET_REQUEST,
  DATASET_SCHEMA_CHANGE_FIELD_TYPE,
  DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN,
  FILTER_ADD,
  FILTER_CLEAR,
  FILTER_MODIFY_EXTENT,
  FILTER_MODIFY_MAX_BOUND,
  FILTER_MODIFY_MIN_BOUND,
  FILTER_MODIFY_ONE_OF,
  FILTER_MODIFY_TIME_UNIT,
  FILTER_REMOVE,
  RESULT_RECEIVE,
  RESULT_REQUEST,
  SET_APPLICATION_STATE,
  SHELF_CLEAR,
  SHELF_FIELD_ADD,
  SHELF_FIELD_AUTO_ADD,
  SHELF_FIELD_MOVE,
  SHELF_FIELD_REMOVE,
  SHELF_FUNCTION_CHANGE,
  SHELF_MARK_CHANGE_TYPE,
  SHELF_PREVIEW_SPEC,
  SHELF_PREVIEW_SPEC_DISABLE,
  SHELF_SPEC_LOAD,
} from '../actions';

import {ActionType} from '../actions';
import {RESET} from '../actions/reset';
import {
  DEFAULT_PERSISTENT_STATE,
  DEFAULT_UNDOABLE_STATE_BASE,
  PersistentState,
  State,
  UndoableStateBase
} from '../models/index';
import {bookmarkReducer} from './bookmark';
import {configReducer} from './config';
import {datasetReducer} from './dataset';
import {makeResetReducer, ResetIndex} from './reset';
import {resultIndexReducer} from './result';
import {shelfReducer} from './shelf';
import {shelfPreviewReducer} from './shelf-preview';
import {stateReducer} from './state';

/**
 * Whether to reset a particular property of the undoable state during RESET action
 */
const undoableStateToReset: ResetIndex<UndoableStateBase> = {
  config: false,
  dataset: true,
  shelf: true,
  result: true
};

const undoableReducerBase = makeResetReducer(
  (state: Readonly<UndoableStateBase> = DEFAULT_UNDOABLE_STATE_BASE, action: Action): UndoableStateBase => {
    return {
      config: configReducer(state.config, action),
      dataset: datasetReducer(state.dataset, action),
      shelf: shelfReducer(state.shelf, action, state.dataset.schema),
      result: resultIndexReducer(state.result, action)
    };
  },
  undoableStateToReset,
  DEFAULT_UNDOABLE_STATE_BASE
);

/**
 * Whether to reset a particular property of the persistent state during RESET action
 */
const persistentStateToReset: ResetIndex<PersistentState> = {
  bookmark: true,
  shelfPreview: true
};

const persistentReducer = makeResetReducer(
  combineReducers({
    bookmark: bookmarkReducer,
    shelfPreview: shelfPreviewReducer
  }),
  persistentStateToReset,
  DEFAULT_PERSISTENT_STATE
);


/**
 * Exclude these actions from the history completely.
 */
export const ACTIONS_EXCLUDED_FROM_HISTORY: ActionType[] = [
  // These actions are automatically re-triggered by some of the shelf components after
  // every state change. Including UNDO/REDO.
  RESULT_RECEIVE,
  RESULT_REQUEST,
  // These actions are not (at least at the moment) trigerrable from a user action.
  // They are either initialization options or triggered by an api call when embedding voyager.
  SET_CONFIG,
  // Undo and Redo actions will not be put in the history, but listing them here
  // allows to check that every action is put in one of these lists.
  UNDO,
  REDO,
  // Reset app state completely
  RESET,
  SET_APPLICATION_STATE,
];

/**
 * A list of actions that can be initiated by a user.
 *
 * Each of these will start a new 'undo group'. Non-user actions will be put into the group
 * of the preceding user action if one is available. If none is available it will be put
 * into its own group.
 */
export const USER_ACTIONS: ActionType[] = [
  // Bookmark Actions
  BOOKMARK_ADD_PLOT,
  BOOKMARK_CLEAR_ALL,
  BOOKMARK_MODIFY_NOTE,
  BOOKMARK_REMOVE_PLOT,

  // Dataset Actions
  DATASET_SCHEMA_CHANGE_FIELD_TYPE,
  DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN,
  DATASET_REQUEST,
  // Filter Actions
  FILTER_ADD,
  FILTER_CLEAR,
  FILTER_MODIFY_EXTENT,
  FILTER_MODIFY_MAX_BOUND,
  FILTER_MODIFY_MIN_BOUND,
  FILTER_MODIFY_ONE_OF,
  FILTER_MODIFY_TIME_UNIT,
  FILTER_REMOVE,
  // Shelf Actions,
  SHELF_CLEAR,
  SHELF_MARK_CHANGE_TYPE,
  SHELF_FIELD_ADD,
  SHELF_FIELD_AUTO_ADD,
  SHELF_FIELD_REMOVE,
  SHELF_FIELD_MOVE,
  SHELF_FUNCTION_CHANGE,
  SHELF_SPEC_LOAD,
  SHELF_PREVIEW_SPEC,
  SHELF_PREVIEW_SPEC_DISABLE
];


export const USER_ACTION_INDEX: Object = toSet(USER_ACTIONS);

/**
 * Actions that are to be grouped with actions that precede them.
 *
 * This list is here for documentation purposes
 *
 * DATASET_INLINE_RECEIVE,
 * DATASET_URL_RECEIVE,
 */

export const GROUPED_ACTIONS: ActionType[] = [
  DATASET_RECEIVE,
  DATASET_RECEIVE,
];

let _groupId = 0;
function getNextGroupId(): number {
  _groupId += 1;
  return _groupId;
}

function groupAction(action: Action, currentState: UndoableStateBase,
                     previousHistory: StateWithHistory<UndoableStateBase>): any {
  const currentActionType = action.type;

  if (USER_ACTION_INDEX[currentActionType]) {
    const nextGroupID = currentActionType + getNextGroupId();
    return nextGroupID;
  } else {
    const lastGroup = previousHistory.group;
    return lastGroup;
  }
};

const undoableReducer = undoable<UndoableStateBase>(undoableReducerBase, {
  limit: HISTORY_LIMIT,
  undoType: UNDO,
  redoType: REDO,
  groupBy: groupAction as any, // Typescript seems dumb about it
  filter: excludeAction(ACTIONS_EXCLUDED_FROM_HISTORY),
});

const rootBase = combineReducers<State>({
  persistent: persistentReducer,
  undoable: undoableReducer
});

export function rootReducer(state: Readonly<State> = DEFAULT_STATE, action: Action) {
  if (action.type === SET_APPLICATION_STATE) {
    return stateReducer(state, action);
  } else {
    return rootBase(state, action);
  }
}
