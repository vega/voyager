"use strict";
// Imports to satisfy --declarations build requirements
// https://github.com/Microsoft/TypeScript/issues/9944
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var reselect_1 = require("reselect");
var filter_1 = require("../models/shelf/filter");
var dataset_1 = require("./dataset");
var shelf_1 = require("./shelf");
// tslint:disable-next-line:no-unused-variable
__export(require("./dataset"));
__export(require("./result"));
__export(require("./shelf"));
exports.selectBookmark = function (state) { return state.persistent.bookmark; };
exports.selectConfig = function (state) { return state.persistent.config; };
exports.selectRelatedViews = function (state) { return state.persistent.relatedViews; };
exports.selectShelfPreview = function (state) { return state.persistent.shelfPreview; };
exports.selectLog = function (state) { return state.persistent.log; };
exports.selectCustomWildcardFields = function (state) {
    return state.undoable.present.customWildcardFields;
};
exports.selectFilteredData = reselect_1.createSelector(dataset_1.selectData, shelf_1.selectFilters, function (data, filters) {
    if (!data || filters.length === 0) {
        return data;
    }
    var filter = filter_1.toPredicateFunction(filters);
    var values = data.values.filter(filter);
    return { values: values };
});
//# sourceMappingURL=index.js.map