"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("compassql/build/src/query/spec");
var shelf_preview_1 = require("../actions/shelf-preview");
var index_1 = require("../actions/shelf/index");
var spec_2 = require("../actions/shelf/spec");
var shelf_preview_2 = require("../models/shelf-preview");
var spec_3 = require("../models/shelf/spec");
function shelfPreviewReducer(preview, action) {
    if (preview === void 0) { preview = shelf_preview_2.DEFAULT_SHELF_PREVIEW; }
    switch (action.type) {
        case shelf_preview_1.SHELF_PREVIEW_QUERY:
            var query = action.payload.query;
            return {
                spec: spec_3.fromSpecQuery(query.spec)
            };
        case shelf_preview_1.SHELF_PREVIEW_SPEC:
            var spec = action.payload.spec;
            var specQ = spec_1.fromSpec(spec);
            return {
                spec: spec_3.fromSpecQuery(specQ)
            };
        // Spec Loading should also clear shelf preview
        case spec_2.SPEC_LOAD:
        case index_1.SHELF_LOAD_QUERY:
        case shelf_preview_1.SHELF_PREVIEW_DISABLE:
            return { spec: null };
    }
    return preview;
}
exports.shelfPreviewReducer = shelfPreviewReducer;
//# sourceMappingURL=shelf-preview.js.map