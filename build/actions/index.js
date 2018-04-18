"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("./shelf/spec");
var tab_1 = require("./tab");
__export(require("./bookmark"));
__export(require("./custom-wildcard-field"));
__export(require("./config"));
__export(require("./dataset"));
__export(require("./log"));
__export(require("./redux-action"));
__export(require("./related-views"));
__export(require("./reset"));
__export(require("./result"));
__export(require("./shelf"));
__export(require("./state"));
__export(require("./tab"));
__export(require("./undo-redo"));
__export(require("./shelf-preview"));
// Use type to enforce that ACTION_TYPE_INDEX contains all action types.
exports.ACTION_TYPE_INDEX = __assign({ BOOKMARK_ADD_PLOT: 1, BOOKMARK_CLEAR_ALL: 1, BOOKMARK_MODIFY_NOTE: 1, BOOKMARK_REMOVE_PLOT: 1, CUSTOM_WILDCARD_ADD: 1, CUSTOM_WILDCARD_ADD_FIELD: 1, CUSTOM_WILDCARD_MODIFY_DESCRIPTION: 1, CUSTOM_WILDCARD_REMOVE: 1, CUSTOM_WILDCARD_REMOVE_FIELD: 1, DATASET_SCHEMA_CHANGE_FIELD_TYPE: 1, DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN: 1, DATASET_REQUEST: 1, DATASET_RECEIVE: 1, FILTER_ADD: 1, FILTER_CLEAR: 1, FILTER_MODIFY_EXTENT: 1, FILTER_MODIFY_MAX_BOUND: 1, FILTER_MODIFY_MIN_BOUND: 1, FILTER_MODIFY_TIME_UNIT: 1, FILTER_MODIFY_ONE_OF: 1, FILTER_REMOVE: 1, FILTER_TOGGLE: 1, LOG_ERRORS_ADD: 1, LOG_ERRORS_CLEAR: 1, LOG_WARNINGS_ADD: 1, LOG_WARNINGS_CLEAR: 1, RELATED_VIEWS_HIDE_TOGGLE: 1, RESULT_RECEIVE: 1, RESULT_REQUEST: 1, RESULT_LIMIT_INCREASE: 1, RESULT_MODIFY_FIELD_PROP: 1, RESULT_MODIFY_NESTED_FIELD_PROP: 1, RESET: 1, SET_CONFIG: 1, SHELF_AUTO_ADD_COUNT_CHANGE: 1, SHELF_LOAD_QUERY: 1, SHELF_GROUP_BY_CHANGE: 1, SHELF_PREVIEW_SPEC: 1, SHELF_PREVIEW_QUERY: 1, SHELF_PREVIEW_DISABLE: 1 }, spec_1.SPEC_ACTION_TYPE_INDEX, tab_1.TAB_ACTION_TYPE_INDEX, { UNDO: 1, REDO: 1, SET_APPLICATION_STATE: 1 });
/** An array of all possible action types. */
exports.ACTION_TYPES = Object.keys(exports.ACTION_TYPE_INDEX);
function isVoyagerAction(action) {
    return exports.ACTION_TYPE_INDEX[action.type];
}
exports.isVoyagerAction = isVoyagerAction;
//# sourceMappingURL=index.js.map