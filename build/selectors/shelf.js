"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reselect_1 = require("reselect");
var index_1 = require("../models/shelf/index");
var spec_1 = require("../models/shelf/spec");
exports.selectFilters = function (state) { return state.undoable.present.shelf.spec.filters; };
exports.selectShelf = function (state) { return state.undoable.present.shelf; };
exports.selectQuery = reselect_1.createSelector(exports.selectShelf, function (shelf) {
    return index_1.toQuery(shelf);
});
exports.selectQuerySpec = reselect_1.createSelector(exports.selectQuery, function (query) { return query.spec; });
exports.selectIsQuerySpecific = reselect_1.createSelector(exports.selectQuerySpec, function (spec) {
    return !spec_1.hasWildcards(spec).hasAnyWildcard;
});
exports.selectIsQueryEmpty = reselect_1.createSelector(exports.selectQuerySpec, function (spec) {
    return spec.encodings.length === 0;
});
