"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./config"));
__export(require("./dataset"));
__export(require("./result"));
__export(require("./redux-action"));
__export(require("./shelf"));
__export(require("./undo-redo"));
// Use type to enforce that ACTION_TYPE_INDEX contains all action types.
var ACTION_TYPE_INDEX = {
    DATASET_URL_REQUEST: 1,
    DATASET_URL_RECEIVE: 1,
    DATASET_INLINE_RECEIVE: 1,
    RESULT_RECEIVE: 1,
    RESULT_REQUEST: 1,
    SET_CONFIG: 1,
    SHELF_CLEAR: 1,
    SHELF_MARK_CHANGE_TYPE: 1,
    SHELF_FIELD_ADD: 1,
    SHELF_FIELD_AUTO_ADD: 1,
    SHELF_FIELD_MOVE: 1,
    SHELF_FIELD_REMOVE: 1,
    SHELF_FUNCTION_CHANGE: 1,
    SHELF_SPEC_LOAD: 1,
    SHELF_SPEC_PREVIEW: 1,
    SHELF_SPEC_PREVIEW_DISABLE: 1,
    UNDO: 1,
    REDO: 1,
};
/** An array of all possible action types. */
exports.ACTION_TYPES = Object.keys(ACTION_TYPE_INDEX);
