"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("compassql/build/src/query/spec");
var shelf_preview_1 = require("../actions/shelf-preview");
var shelf_preview_2 = require("../models/shelf-preview");
var spec_2 = require("../models/shelf/spec");
function shelfPreviewReducer(preview, action) {
    if (preview === void 0) { preview = shelf_preview_2.DEFAULT_SHELF_PREVIEW; }
    switch (action.type) {
        case shelf_preview_1.SHELF_PREVIEW_SPEC:
            var spec = action.payload.spec;
            var specQ = spec_1.fromSpec(spec);
            return {
                spec: spec_2.fromSpecQuery(specQ)
            };
        case shelf_preview_1.SHELF_PREVIEW_SPEC_DISABLE:
            return { spec: null };
    }
    return preview;
}
exports.shelfPreviewReducer = shelfPreviewReducer;
