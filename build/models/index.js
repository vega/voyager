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
var schema_1 = require("compassql/build/src/schema");
var bookmark_1 = require("./bookmark");
var config_1 = require("./config");
var dataset_1 = require("./dataset");
var result_1 = require("./result");
var shelf_1 = require("./shelf");
var shelf_preview_1 = require("./shelf-preview");
__export(require("./bookmark"));
__export(require("./dataset"));
__export(require("./shelf"));
__export(require("./result"));
__export(require("./config"));
;
exports.DEFAULT_UNDOABLE_STATE_BASE = {
    config: config_1.DEFAULT_VOYAGER_CONFIG,
    dataset: dataset_1.DEFAULT_DATASET,
    shelf: shelf_1.DEFAULT_SHELF,
    result: result_1.DEFAULT_RESULT_INDEX,
};
exports.DEFAULT_UNDOABLE_STATE = {
    past: [],
    present: exports.DEFAULT_UNDOABLE_STATE_BASE,
    future: [],
    _latestUnfiltered: null,
    group: null
};
exports.DEFAULT_PERSISTENT_STATE = {
    bookmark: bookmark_1.DEFAULT_BOOKMARK,
    shelfPreview: shelf_preview_1.DEFAULT_SHELF_PREVIEW
};
exports.DEFAULT_STATE = {
    persistent: exports.DEFAULT_PERSISTENT_STATE,
    undoable: exports.DEFAULT_UNDOABLE_STATE
};
function toSerializable(state) {
    var persistentState = state.persistent;
    var undoableState = state.undoable.present;
    return {
        bookmark: persistentState.bookmark,
        config: undoableState.config,
        shelf: undoableState.shelf,
        shelfPreview: persistentState.shelfPreview,
        result: undoableState.result,
        dataset: {
            isLoading: undoableState.dataset.isLoading,
            name: undoableState.dataset.name,
            data: undoableState.dataset.data,
        },
        tableschema: undoableState.dataset.schema.tableSchema(),
    };
}
exports.toSerializable = toSerializable;
function fromSerializable(serializable) {
    var bookmark = serializable.bookmark, config = serializable.config, shelf = serializable.shelf, shelfPreview = serializable.shelfPreview, result = serializable.result, dataset = serializable.dataset, tableschema = serializable.tableschema;
    return {
        persistent: {
            bookmark: bookmark,
            shelfPreview: shelfPreview
        },
        undoable: {
            past: [],
            present: {
                config: config,
                dataset: __assign({}, dataset, { schema: new schema_1.Schema(serializable.tableschema) }),
                shelf: shelf,
                result: result
            },
            future: [],
            _latestUnfiltered: null,
            group: null
        }
    };
}
exports.fromSerializable = fromSerializable;
