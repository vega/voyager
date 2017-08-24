import { BookmarkAction } from './bookmark';
import { ConfigAction } from './config';
import { DatasetAction } from './dataset';
import { LogAction } from './log';
import { ResetAction } from './reset';
import { ResultAction } from './result';
import { ShelfAction } from './shelf';
import { ShelfPreviewAction } from './shelf-preview';
import { ApplicationStateAction } from './state';
import { UndoableAction } from './undo-redo';
export * from './bookmark';
export * from './config';
export * from './dataset';
export * from './log';
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
export declare type Action = (ApplicationStateAction | BookmarkAction | ConfigAction | DatasetAction | LogAction | ResetAction | ResultAction | ShelfAction | ShelfPreviewAction | UndoableAction);
export declare type ActionType = Action['type'];
/** An array of all possible action types. */
export declare const ACTION_TYPES: ("SET_CONFIG" | "SPEC_LOAD" | "SET_APPLICATION_STATE" | "BOOKMARK_ADD_PLOT" | "BOOKMARK_CLEAR_ALL" | "BOOKMARK_REMOVE_PLOT" | "BOOKMARK_MODIFY_NOTE" | "DATASET_SCHEMA_CHANGE_FIELD_TYPE" | "DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN" | "DATASET_REQUEST" | "DATASET_RECEIVE" | "LOG_ERRORS_ADD" | "LOG_WARNINGS_ADD" | "LOG_WARNINGS_CLEAR" | "LOG_ERRORS_CLEAR" | "RESET" | "RESULT_REQUEST" | "RESULT_RECEIVE" | "RESULT_LIMIT_INCREASE" | "RESULT_MODIFY_FIELD_PROP" | "RESULT_MODIFY_NESTED_FIELD_PROP" | "FILTER_ADD" | "FILTER_CLEAR" | "FILTER_REMOVE" | "FILTER_MODIFY_EXTENT" | "FILTER_MODIFY_MIN_BOUND" | "FILTER_MODIFY_MAX_BOUND" | "FILTER_MODIFY_ONE_OF" | "FILTER_MODIFY_TIME_UNIT" | "SPEC_CLEAR" | "SPEC_MARK_CHANGE_TYPE" | "SPEC_FIELD_ADD" | "SPEC_FIELD_AUTO_ADD" | "SPEC_FIELD_REMOVE" | "SPEC_FIELD_MOVE" | "SPEC_FIELD_PROP_CHANGE" | "SPEC_FIELD_NESTED_PROP_CHANGE" | "SPEC_FUNCTION_CHANGE" | "SPEC_FUNCTION_ADD_WILDCARD" | "SPEC_FUNCTION_REMOVE_WILDCARD" | "SPEC_FUNCTION_DISABLE_WILDCARD" | "SPEC_FUNCTION_ENABLE_WILDCARD" | "SHELF_LOAD_QUERY" | "SHELF_AUTO_ADD_COUNT_CHANGE" | "SHELF_GROUP_BY_CHANGE" | "SHELF_PREVIEW_SPEC" | "SHELF_PREVIEW_QUERY" | "SHELF_PREVIEW_DISABLE" | "UNDO" | "REDO")[];
