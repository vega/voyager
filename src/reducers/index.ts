import undoable, {excludeAction, StateWithHistory} from 'redux-undo';
import {toSet} from 'vega-util';

import {Action, REDO, UNDO} from '../actions';
import {HISTORY_LIMIT} from '../constants';
import {DEFAULT_STATE, State, StateBase} from '../models';

import {SET_CONFIG} from '../actions/config';

import {
  DATASET_INLINE_RECEIVE,
  DATASET_URL_RECEIVE,
  DATASET_URL_REQUEST,
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
  SHELF_SPEC_LOAD,
  SHELF_SPEC_PREVIEW,
  SHELF_SPEC_PREVIEW_DISABLE,
} from '../actions';

import {ActionType} from '../actions';
import {configReducer} from './config';
import {datasetReducer} from './dataset';
import {resultReducer} from './result';
import {shelfReducer} from './shelf';
import {stateReducer} from './state';


function reducer(state: Readonly<StateBase> = DEFAULT_STATE, action: Action): StateBase {
  if (action.type === SET_APPLICATION_STATE) {
    return stateReducer(state, action);
  } else {
    return {
      config: configReducer(state.config, action),
      dataset: datasetReducer(state.dataset, action),
      shelf: shelfReducer(state.shelf, action, state.dataset.schema),
      result: resultReducer(state.result, action)
    };
  }
}

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
  // Dataset Actions
  DATASET_URL_REQUEST,
  // Shelf Actions,
  SHELF_CLEAR,
  SHELF_MARK_CHANGE_TYPE,
  SHELF_FIELD_ADD,
  SHELF_FIELD_AUTO_ADD,
  SHELF_FIELD_REMOVE,
  SHELF_FIELD_MOVE,
  SHELF_FUNCTION_CHANGE,
  SHELF_SPEC_LOAD,
  SHELF_SPEC_PREVIEW,
  SHELF_SPEC_PREVIEW_DISABLE,
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
  DATASET_INLINE_RECEIVE,
  DATASET_URL_RECEIVE,
];

let _groupId = 0;
function getNextGroupId(): number {
  _groupId += 1;
  return _groupId;
}

function groupAction(action: Action, currentState: State, previousHistory: StateWithHistory<State>): any {
  const currentActionType = action.type;

  if (USER_ACTION_INDEX[currentActionType]) {
    const nextGroupID = currentActionType + getNextGroupId();
    return nextGroupID;
  } else {
    const lastGroup = previousHistory.group;
    return lastGroup;
  }
};

export const rootReducer = undoable(reducer, {
  limit: HISTORY_LIMIT,
  undoType: UNDO,
  redoType: REDO,
  groupBy: groupAction,
  filter: excludeAction(ACTIONS_EXCLUDED_FROM_HISTORY),
});
