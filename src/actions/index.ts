import {BookmarkAction} from './bookmark';
import {ConfigAction} from './config';
import {DatasetAction} from './dataset';
import {ResetAction} from './reset';
import {ResultAction} from './result';
import {ShelfAction} from './shelf';
import {ShelfPreviewAction} from './shelf-preview';
import {ApplicationStateAction} from './state';
import {UndoableAction} from './undo-redo';

export * from './bookmark';
export * from './config';
export * from './dataset';
export * from './redux-action';
export * from './reset';
export * from './result';
export * from './shelf';
export * from './state';
export * from './undo-redo';
export * from './shelf-preview';

/**
 * Union type of all actions in our application.
 */
export type Action = (
  ApplicationStateAction |
  BookmarkAction |
  ConfigAction |
  DatasetAction |
  ResetAction |
  ResultAction |
  ShelfAction |
  ShelfPreviewAction |
  UndoableAction
);

export type ActionType = Action['type'];

// Use type to enforce that ACTION_TYPE_INDEX contains all action types.
const ACTION_TYPE_INDEX: {[k in ActionType]: 1} = {
  BOOKMARK_ADD_PLOT: 1,
  BOOKMARK_CLEAR_ALL: 1,
  BOOKMARK_MODIFY_NOTE: 1,
  BOOKMARK_REMOVE_PLOT: 1,

  DATASET_SCHEMA_CHANGE_FIELD_TYPE: 1,
  DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN: 1,

  DATASET_REQUEST: 1,
  DATASET_RECEIVE: 1,

  FILTER_ADD: 1,
  FILTER_CLEAR: 1,
  FILTER_MODIFY_EXTENT: 1,
  FILTER_MODIFY_MAX_BOUND: 1,
  FILTER_MODIFY_MIN_BOUND: 1,
  FILTER_MODIFY_TIME_UNIT: 1,
  FILTER_MODIFY_ONE_OF: 1,
  FILTER_REMOVE: 1,

  RESULT_RECEIVE: 1,
  RESULT_REQUEST: 1,
  RESULT_LIMIT_INCREASE: 1,

  RESET: 1,

  SET_CONFIG: 1,

  SPEC_CLEAR: 1,
  SPEC_MARK_CHANGE_TYPE: 1,
  SPEC_FIELD_ADD: 1,
  SPEC_FIELD_AUTO_ADD: 1,
  SPEC_FIELD_MOVE: 1,
  SPEC_FIELD_REMOVE: 1,
  SPEC_FUNCTION_CHANGE: 1,
  SPEC_FUNCTION_ADD_WILDCARD: 1,
  SPEC_FUNCTION_DISABLE_WILDCARD: 1,
  SPEC_FUNCTION_ENABLE_WILDCARD: 1,
  SPEC_FUNCTION_REMOVE_WILDCARD: 1,
  SPEC_LOAD: 1,
  SHELF_PREVIEW_SPEC: 1,
  SHELF_PREVIEW_SPEC_DISABLE: 1,

  UNDO: 1,
  REDO: 1,

  SET_APPLICATION_STATE: 1,
};

/** An array of all possible action types. */
export const ACTION_TYPES = Object.keys(ACTION_TYPE_INDEX) as ActionType[];
