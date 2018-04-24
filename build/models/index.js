"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("compassql/build/src/schema");
var bookmark_1 = require("./bookmark");
var config_1 = require("./config");
var custom_wildcard_field_1 = require("./custom-wildcard-field");
var dataset_1 = require("./dataset");
var log_1 = require("./log");
var related_views_1 = require("./related-views");
var shelf_preview_1 = require("./shelf-preview");
var tab_1 = require("./tab");
__export(require("./bookmark"));
__export(require("./dataset"));
__export(require("./shelf"));
__export(require("./result"));
__export(require("./config"));
__export(require("./tab"));
;
exports.DEFAULT_UNDOABLE_STATE_BASE = {
    customWildcardFields: custom_wildcard_field_1.DEFAULT_CUSTOM_WILDCARD_FIELDS,
    dataset: dataset_1.DEFAULT_DATASET,
    tab: tab_1.DEFAULT_TAB,
};
exports.DEFAULT_UNDOABLE_STATE = {
    past: [],
    present: exports.DEFAULT_UNDOABLE_STATE_BASE,
    future: [],
    _latestUnfiltered: null,
    group: null,
    index: null,
    limit: 30
};
exports.DEFAULT_PERSISTENT_STATE = {
    bookmark: bookmark_1.DEFAULT_BOOKMARK,
    config: config_1.DEFAULT_VOYAGER_CONFIG,
    log: log_1.DEFAULT_LOG,
    relatedViews: related_views_1.DEFAULT_RELATED_VIEWS,
    shelfPreview: shelf_preview_1.DEFAULT_SHELF_PREVIEW
};
exports.DEFAULT_STATE = {
    persistent: exports.DEFAULT_PERSISTENT_STATE,
    undoable: exports.DEFAULT_UNDOABLE_STATE
};
function toSerializable(state) {
    var _a = state.undoable.present, dataset = _a.dataset, undoableStateBaseWithoutDataset = __rest(_a, ["dataset"]);
    var schema = dataset.schema, datasetWithoutSchema = __rest(dataset, ["schema"]);
    return __assign({}, state.persistent, undoableStateBaseWithoutDataset, { dataset: datasetWithoutSchema, tableschema: schema.tableSchema() });
}
exports.toSerializable = toSerializable;
function fromSerializable(serializable) {
    var 
    // Data
    datasetWithoutSchema = serializable.dataset, tableschema = serializable.tableschema, 
    // Persistent
    bookmark = serializable.bookmark, config = serializable.config, log = serializable.log, relatedViews = serializable.relatedViews, shelfPreview = serializable.shelfPreview, 
    // Then the rest should be UndoableStateBaseWithoutDataset
    undoableStateBaseWithoutDataset = __rest(serializable, ["dataset", "tableschema", "bookmark", "config", "log", "relatedViews", "shelfPreview"]);
    var persistent = { bookmark: bookmark, config: config, relatedViews: relatedViews, shelfPreview: shelfPreview, log: log };
    var undoableBase = __assign({}, undoableStateBaseWithoutDataset, { dataset: __assign({}, datasetWithoutSchema, { schema: new schema_1.Schema(serializable.tableschema) }) });
    return {
        persistent: persistent,
        undoable: __assign({}, exports.DEFAULT_UNDOABLE_STATE, { present: undoableBase })
    };
}
exports.fromSerializable = fromSerializable;
//# sourceMappingURL=index.js.map