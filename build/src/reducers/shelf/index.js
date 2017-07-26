"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shelf_1 = require("../../models/shelf");
var spec_1 = require("./spec");
var spec_preview_1 = require("./spec-preview");
function shelfReducer(shelf, action, schema) {
    if (shelf === void 0) { shelf = shelf_1.DEFAULT_SHELF_SPEC; }
    var spec = spec_1.shelfSpecReducer(shelf.spec, action, schema);
    var specPreview = spec_preview_1.shelfSpecPreviewReducer(shelf.specPreview, action);
    if (spec !== shelf.spec || specPreview !== shelf.specPreview) {
        // Make sure we only re-create a new object if something has changed.
        // TODO: decouple specPreview from shelf as it does not affect the compiled query.
        // TODO: once we have more query-based property here, better use some combineReducers() like function.
        // The problem is that combineReducer does not support additional parameter like `schema`
        // that we need for `shelfSpecReducer`
        return { spec: spec, specPreview: specPreview };
    }
    return shelf;
}
exports.shelfReducer = shelfReducer;
