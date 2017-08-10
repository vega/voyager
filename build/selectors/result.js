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
// tslint:disable:no-unused-variable
var model_1 = require("compassql/build/src/model");
var reselect_1 = require("reselect");
var plot_1 = require("../models/plot");
var result_1 = require("../models/result");
var spec_1 = require("../models/shelf/spec");
var dataset_1 = require("./dataset");
var shelf_1 = require("./shelf");
// tslint:enable:no-unused-variable
exports.selectResult = result_1.RESULT_TYPES.reduce(function (selectors, resultType) {
    selectors[resultType] = function (state) { return state.undoable.present.result[resultType]; };
    return selectors;
}, {});
exports.selectMainSpec = reselect_1.createSelector(shelf_1.selectIsQuerySpecific, shelf_1.selectIsQueryEmpty, dataset_1.selectData, shelf_1.selectFilters, exports.selectResult.main, function (isQuerySpecific, isQueryEmpty, data, filters, mainResult) {
    if (!isQuerySpecific || !mainResult.modelGroup || isQueryEmpty) {
        return undefined;
    }
    return __assign({ data: data, transform: spec_1.getTransforms(filters) }, model_1.getTopSpecQueryItem(mainResult.modelGroup).spec);
});
exports.selectPlotList = result_1.RESULT_TYPES.reduce(function (selectors, resultType) {
    selectors[resultType] = reselect_1.createSelector(shelf_1.selectIsQuerySpecific, dataset_1.selectData, shelf_1.selectFilters, exports.selectResult[resultType], function (isQuerySpecific, data, filters, result) {
        if (
        // For main, do not return list if specific.  For others, do not return list if not specific.
        ((resultType === 'main') === isQuerySpecific) ||
            !result.modelGroup) {
            return undefined;
        }
        // FIXME(https://github.com/vega/voyager/issues/448): use data and filter
        return plot_1.extractPlotObjects(result.modelGroup, filters);
    });
    return selectors;
}, {});
