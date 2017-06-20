"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("./spec");
var spec_preview_1 = require("./spec-preview");
var shelf_1 = require("../../models/shelf");
function shelfReducer(shelf, action, schema) {
    if (shelf === void 0) { shelf = shelf_1.DEFAULT_SHELF_SPEC; }
    return {
        spec: spec_1.shelfSpecReducer(shelf.spec, action, schema),
        specPreview: spec_preview_1.shelfSpecPreviewReducer(shelf.specPreview, action)
    };
}
exports.shelfReducer = shelfReducer;
