"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./bookmark"));
__export(require("./config"));
__export(require("./dataset"));
__export(require("./redux-action"));
__export(require("./reset"));
__export(require("./result"));
__export(require("./shelf"));
__export(require("./state"));
__export(require("./undo-redo"));
__export(require("./shelf-preview"));
// Use type to enforce that ACTION_TYPE_INDEX contains all action types.
var ACTION_TYPE_INDEX = {
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
    RESULT_MODIFY_FIELD_PROP: 1,
    RESULT_MODIFY_NESTED_FIELD_PROP: 1,
    RESET: 1,
    SET_CONFIG: 1,
    SHELF_AUTO_ADD_COUNT_CHANGE: 1,
    SHELF_LOAD_QUERY: 1,
    SHELF_GROUP_BY_CHANGE: 1,
    SHELF_PREVIEW_SPEC: 1,
    SHELF_PREVIEW_QUERY: 1,
    SHELF_PREVIEW_DISABLE: 1,
    SPEC_CLEAR: 1,
    SPEC_LOAD: 1,
    SPEC_MARK_CHANGE_TYPE: 1,
    SPEC_FIELD_ADD: 1,
    SPEC_FIELD_AUTO_ADD: 1,
    SPEC_FIELD_MOVE: 1,
    SPEC_FIELD_PROP_CHANGE: 1,
    SPEC_FIELD_NESTED_PROP_CHANGE: 1,
    SPEC_FIELD_REMOVE: 1,
    SPEC_FUNCTION_CHANGE: 1,
    SPEC_FUNCTION_ADD_WILDCARD: 1,
    SPEC_FUNCTION_DISABLE_WILDCARD: 1,
    SPEC_FUNCTION_ENABLE_WILDCARD: 1,
    SPEC_FUNCTION_REMOVE_WILDCARD: 1,
    UNDO: 1,
    REDO: 1,
    SET_APPLICATION_STATE: 1,
};
/** An array of all possible action types. */
exports.ACTION_TYPES = Object.keys(ACTION_TYPE_INDEX);
//# sourceMappingURL=index.js.map