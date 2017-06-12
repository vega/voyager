import undoable, {excludeAction, StateWithHistory} from 'redux-undo';

import {Action, REDO, UNDO} from '../actions';
import {HISTORY_LIMIT} from '../constants';
import {StateBase} from '../models';

import {SET_CONFIG} from '../actions/config';
import {
  DATASET_INLINE_RECEIVE,
  DATASET_URL_RECEIVE,
  DATASET_URL_REQUEST,
} from '../actions/dataset';
import {
  RESULT_RECEIVE,
  RESULT_REQUEST,
} from '../actions/result';
import {
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
} from '../actions/shelf';
import { State } from '../models/index';
import {configReducer} from './config';
import {datasetReducer} from './dataset';
import {resultReducer} from './result';
import {shelfReducer} from './shelf';


function reducer(state: Readonly<StateBase>, action: Action): StateBase {
  return {
    config: configReducer(state.config, action),
    dataset: datasetReducer(state.dataset, action),
    shelf: shelfReducer(state.shelf, action, state.dataset.schema),
    result: resultReducer(state.result, action)
  };
}

/**
 * Exclude these actions from the history completely.
 */
const excludeActionsInHistory = [DATASET_INLINE_RECEIVE,
  RESULT_RECEIVE,
  RESULT_REQUEST,
  SET_CONFIG,
];

/**
 * A list of actions that can be initiated by a user.
 *
 * Each of these will start a new 'undo group'. Non-user actions will be put into the group
 * of the preceding user action if one is available. If none is available it will be put
 * into its own group.
 */
const userActions = [
  // Dataset Actions
  DATASET_URL_REQUEST,
  DATASET_URL_RECEIVE,
  DATASET_INLINE_RECEIVE,
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

let _groupId = 0;
function getNextGroupId(): number {
  _groupId += 1;
  return _groupId;
}

const groupAction = (action: Action, currentState: State, previousHistory: StateWithHistory<State>): any => {
  const currentActionType = action.type;

  if (userActions.indexOf(currentActionType) >= 0) {
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
  filter: excludeAction(excludeActionsInHistory),
  debug: true,
});

