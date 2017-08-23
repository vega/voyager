"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:enable:no-unused-variable
var reselect_1 = require("reselect");
var result_1 = require("../models/result");
var spec_1 = require("../models/shelf/spec");
var dataset_1 = require("./dataset");
var shelf_1 = require("./shelf");
exports.selectResult = result_1.RESULT_TYPES.reduce(function (selectors, resultType) {
    selectors[resultType] = function (state) { return state.undoable.present.result[resultType]; };
    return selectors;
}, {});
exports.selectResultLimit = result_1.RESULT_TYPES.reduce(function (selectors, resultType) {
    selectors[resultType] = reselect_1.createSelector(exports.selectResult[resultType], function (result) { return result.limit; });
    return selectors;
}, {});
// This one is not exported as it does not correctly include filter transforms yet
var selectResultPlots = result_1.RESULT_TYPES.reduce(function (selectors, resultType) {
    selectors[resultType] = reselect_1.createSelector(exports.selectResult[resultType], function (result) { return result.plots; });
    return selectors;
}, {});
exports.selectMainSpec = reselect_1.createSelector(shelf_1.selectIsQuerySpecific, shelf_1.selectIsQueryEmpty, dataset_1.selectData, shelf_1.selectFilters, selectResultPlots.main, function (isQuerySpecific, isQueryEmpty, data, filters, mainPlots) {
    if (!isQuerySpecific || !mainPlots || isQueryEmpty) {
        return undefined;
    }
    return __assign({ data: data, transform: spec_1.getTransforms(filters) }, mainPlots[0].spec);
});
// TODO(https://github.com/vega/voyager/issues/617): get rid of this once we bind data at runtime.
exports.selectPlotList = result_1.RESULT_TYPES.reduce(function (selectors, resultType) {
    selectors[resultType] = reselect_1.createSelector(shelf_1.selectIsQuerySpecific, dataset_1.selectData, shelf_1.selectFilters, selectResultPlots[resultType], function (isQuerySpecific, data, filters, plots) {
        if (
        // For main, do not return list if specific.  For others, do not return list if not specific.
        ((resultType === 'main') === isQuerySpecific) ||
            !plots) {
            return undefined;
        }
        return plots.map(function (p) { return (__assign({}, p, { transform: spec_1.getTransforms(filters) })); });
    });
    return selectors;
}, {});
//# sourceMappingURL=result.js.map