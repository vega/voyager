"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("compassql/build/src/query/spec");
var shelf_1 = require("../../actions/shelf");
var spec_2 = require("../../models/shelf/spec");
function shelfSpecPreviewReducer(preview, action) {
    switch (action.type) {
        case shelf_1.SHELF_SPEC_PREVIEW:
            var spec = action.payload.spec;
            var specQ = spec_1.fromSpec(spec);
            return spec_2.fromSpecQuery(specQ);
        case shelf_1.SHELF_SPEC_PREVIEW_DISABLE:
            return null;
    }
    return preview;
}
exports.shelfSpecPreviewReducer = shelfSpecPreviewReducer;
