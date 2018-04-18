"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reselect_1 = require("reselect");
var index_1 = require("../models/shelf/index");
var spec_1 = require("../models/shelf/spec");
var tab_1 = require("./tab");
exports.selectShelf = reselect_1.createSelector(tab_1.selectActiveTab, function (plotTabState) { return plotTabState.shelf; });
exports.selectShelfGroupBy = reselect_1.createSelector(exports.selectShelf, function (shelf) { return shelf.groupBy; });
exports.selectShelfSpec = reselect_1.createSelector(exports.selectShelf, function (shelf) { return shelf.spec; });
exports.selectFilters = reselect_1.createSelector(exports.selectShelf, function (shelf) { return shelf.filters; });
exports.selectShelfAutoAddCount = reselect_1.createSelector(exports.selectShelf, function (shelf) { return shelf.autoAddCount; });
exports.selectQuery = reselect_1.createSelector(exports.selectShelfSpec, exports.selectShelfGroupBy, exports.selectShelfAutoAddCount, function (spec, groupBy, autoAddCount) {
    return index_1.toQuery({ spec: spec, groupBy: groupBy, autoAddCount: autoAddCount });
});
exports.selectQuerySpec = reselect_1.createSelector(exports.selectQuery, function (query) { return query.spec; });
exports.selectDefaultGroupBy = reselect_1.createSelector(exports.selectQuerySpec, function (specQ) {
    return index_1.getDefaultGroupBy(spec_1.hasWildcards(specQ));
});
exports.selectIsQuerySpecific = reselect_1.createSelector(exports.selectQuerySpec, function (spec) {
    return !spec_1.hasWildcards(spec).hasAnyWildcard;
});
exports.selectIsQueryEmpty = reselect_1.createSelector(exports.selectQuerySpec, function (spec) {
    return spec.encodings.length === 0;
});
//# sourceMappingURL=shelf.js.map