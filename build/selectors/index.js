"use strict";
// Imports to satisfy --declarations build requirements
// https://github.com/Microsoft/TypeScript/issues/9944
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-unused-variable
__export(require("./dataset"));
__export(require("./result"));
__export(require("./shelf"));
exports.selectBookmark = function (state) { return state.persistent.bookmark; };
exports.selectConfig = function (state) { return state.persistent.config; };
exports.selectShelfPreview = function (state) { return state.persistent.shelfPreview; };
//# sourceMappingURL=index.js.map