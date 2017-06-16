"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("./spec");
var spec_preview_1 = require("./spec-preview");
function shelfReducer(shelf, action, schema) {
    return {
        spec: spec_1.shelfSpecReducer(shelf.spec, action, schema),
        specPreview: spec_preview_1.shelfSpecPreviewReducer(shelf.specPreview, action)
    };
}
exports.shelfReducer = shelfReducer;
