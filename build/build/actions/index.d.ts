import { BookmarkAction } from './bookmark';
import { ConfigAction } from './config';
import { DatasetAction } from './dataset';
import { FilterAction } from './filter';
import { ResetAction } from './reset';
import { ResultAction } from './result';
import { ShelfAction } from './shelf';
import { ShelfPreviewAction } from './shelf-preview';
import { ApplicationStateAction } from './state';
import { UndoableAction } from './undo-redo';
export * from './bookmark';
export * from './config';
export * from './dataset';
export * from './filter';
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
export declare type Action = ResetAction | BookmarkAction | DatasetAction | ShelfAction | ShelfPreviewAction | UndoableAction | ResultAction | ConfigAction | ApplicationStateAction | FilterAction;
export declare type ActionType = Action['type'];
/** An array of all possible action types. */
export declare const ACTION_TYPES: ("SET_CONFIG" | "SHELF_SPEC_LOAD" | "SET_APPLICATION_STATE" | "RESET" | "BOOKMARK_ADD_PLOT" | "BOOKMARK_CLEAR_ALL" | "BOOKMARK_REMOVE_PLOT" | "BOOKMARK_MODIFY_NOTE" | "DATASET_SCHEMA_CHANGE_FIELD_TYPE" | "DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN" | "DATASET_REQUEST" | "DATASET_RECEIVE" | "SHELF_CLEAR" | "SHELF_MARK_CHANGE_TYPE" | "SHELF_FIELD_ADD" | "SHELF_FIELD_AUTO_ADD" | "SHELF_FIELD_REMOVE" | "SHELF_FIELD_MOVE" | "SHELF_FUNCTION_CHANGE" | "SHELF_PREVIEW_SPEC" | "SHELF_PREVIEW_SPEC_DISABLE" | "UNDO" | "REDO" | "RESULT_REQUEST" | "RESULT_RECEIVE" | "FILTER_ADD" | "FILTER_CLEAR" | "FILTER_REMOVE" | "FILTER_MODIFY_EXTENT" | "FILTER_MODIFY_MIN_BOUND" | "FILTER_MODIFY_MAX_BOUND" | "FILTER_MODIFY_ONE_OF" | "FILTER_MODIFY_TIME_UNIT")[];
