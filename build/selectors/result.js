"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:enable:no-unused-variable
var reselect_1 = require("reselect");
var result_1 = require("../models/result");
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
exports.selectMainSpec = reselect_1.createSelector(shelf_1.selectIsQuerySpecific, shelf_1.selectIsQueryEmpty, selectResultPlots.main, function (isQuerySpecific, isQueryEmpty, mainPlots) {
    if (!isQuerySpecific || !mainPlots || isQueryEmpty) {
        return undefined;
    }
    return mainPlots[0].spec;
});
//# sourceMappingURL=result.js.map