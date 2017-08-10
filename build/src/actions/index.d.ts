import { BookmarkAction } from './bookmark';
import { ConfigAction } from './config';
import { DatasetAction } from './dataset';
import { FilterAction } from './filter';
import { ResultAction } from './result';
import { ShelfAction } from './shelf';
import { ApplicationStateAction } from './state';
import { UndoableAction } from './undo-redo';
export * from './bookmark';
export * from './config';
export * from './dataset';
export * from './filter';
export * from './redux-action';
export * from './result';
export * from './shelf';
export * from './state';
export * from './undo-redo';
/**
 * Union type of all actions in our application.
 */
export declare type Action = BookmarkAction | DatasetAction | ShelfAction | UndoableAction | ResultAction | ConfigAction | ApplicationStateAction | FilterAction;
export declare type ActionType = Action['type'];
/** An array of all possible action types. */
export declare const ACTION_TYPES: ("BOOKMARK_ADD_PLOT" | "BOOKMARK_REMOVE_PLOT" | "BOOKMARK_MODIFY_NOTE" | "SET_CONFIG" | "FILTER_ADD" | "FILTER_CLEAR" | "FILTER_REMOVE" | "FILTER_MODIFY_EXTENT" | "FILTER_MODIFY_MIN_BOUND" | "FILTER_MODIFY_MAX_BOUND" | "FILTER_MODIFY_ONE_OF" | "FILTER_MODIFY_TIME_UNIT" | "SHELF_CLEAR" | "SHELF_MARK_CHANGE_TYPE" | "SHELF_FIELD_ADD" | "SHELF_FIELD_AUTO_ADD" | "SHELF_FIELD_REMOVE" | "SHELF_FIELD_MOVE" | "SHELF_FUNCTION_CHANGE" | "SHELF_SPEC_LOAD" | "SHELF_SPEC_PREVIEW" | "SHELF_SPEC_PREVIEW_DISABLE" | "DATASET_SCHEMA_CHANGE_FIELD_TYPE" | "DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN" | "DATASET_URL_RECEIVE" | "DATASET_URL_REQUEST" | "DATASET_INLINE_RECEIVE" | "UNDO" | "REDO" | "RESULT_REQUEST" | "RESULT_RECEIVE" | "SET_APPLICATION_STATE")[];
