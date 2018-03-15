"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
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
            var _a = action.payload.spec, _t = _a.transform, specWithoutTransform = __rest(_a, ["transform"]);
            var specQ = spec_1.fromSpec(specWithoutTransform);
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