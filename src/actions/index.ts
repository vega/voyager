import {BookmarkAction} from './bookmark';
import {ConfigAction} from './config';
import {CustomWildcardAction} from './custom-wildcard-field';
import {DatasetAction} from './dataset';
import {LogAction} from './log';
import {RelatedViewsAction} from './related-views';
import {ResetAction} from './reset';
import {ShelfPreviewAction} from './shelf-preview';
import {ApplicationStateAction} from './state';
import {TAB_ACTION_TYPE_INDEX, TabAction} from './tab';
import {UndoableAction} from './undo-redo';

export * from './bookmark';
export * from './custom-wildcard-field';
export * from './config';
export * from './dataset';
export * from './log';
export * from './redux-action';
export * from './reset';
export * from './result';
export * from './shelf';
export * from './state';
export * from './tab';
export * from './undo-redo';
export * from './shelf-preview';

/**
 * Union type of all actions in our application.
 */
export type Action = (
  ApplicationStateAction |
  BookmarkAction |
  ConfigAction |
  CustomWildcardAction |
  DatasetAction |
  LogAction |
  RelatedViewsAction |
  ResetAction |
  ShelfPreviewAction |
  TabAction |
  UndoableAction
);

export type ActionType = Action['type'];

// Use type to enforce that ACTION_TYPE_INDEX contains all action types.
export const ACTION_TYPE_INDEX: {[k in ActionType]: 1} = {
  BOOKMARK_ADD_PLOT: 1,
  BOOKMARK_CLEAR_ALL: 1,
  BOOKMARK_MODIFY_NOTE: 1,
  BOOKMARK_REMOVE_PLOT: 1,

  CUSTOM_WILDCARD_ADD: 1,
  CUSTOM_WILDCARD_ADD_FIELD: 1,
  CUSTOM_WILDCARD_MODIFY_DESCRIPTION: 1,
  CUSTOM_WILDCARD_REMOVE: 1,
  CUSTOM_WILDCARD_REMOVE_FIELD: 1,

  DATASET_SCHEMA_CHANGE_FIELD_TYPE: 1,
  DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN: 1,

  DATASET_REQUEST: 1,
  DATASET_RECEIVE: 1,

  LOG_ERRORS_ADD: 1,
  LOG_ERRORS_CLEAR: 1,
  LOG_WARNINGS_ADD: 1,
  LOG_WARNINGS_CLEAR: 1,

  RELATED_VIEWS_HIDE_TOGGLE: 1,

  RESET: 1,

  SET_CONFIG: 1,

  SHELF_PREVIEW_SPEC: 1,
  SHELF_PREVIEW_QUERY: 1,
  SHELF_PREVIEW_DISABLE: 1,

  ...TAB_ACTION_TYPE_INDEX,

  UNDO: 1,
  REDO: 1,

  SET_APPLICATION_STATE: 1,
};

/** An array of all possible action types. */
export const ACTION_TYPES = Object.keys(ACTION_TYPE_INDEX) as ActionType[];

export function isVoyagerAction(action: {type: any}): action is Action {
  return ACTION_TYPE_INDEX[action.type];
}
