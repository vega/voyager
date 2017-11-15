"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./plot"));
exports.DEFAULT_RESULT = {
    isLoading: false,
    plots: null,
    query: null,
    limit: 8
};
exports.DEFAULT_RESULT_INDEX = {
    main: exports.DEFAULT_RESULT,
    addCategoricalField: exports.DEFAULT_RESULT,
    addQuantitativeField: exports.DEFAULT_RESULT,
    addTemporalField: exports.DEFAULT_RESULT,
    alternativeEncodings: exports.DEFAULT_RESULT,
    histograms: exports.DEFAULT_RESULT,
    summaries: exports.DEFAULT_RESULT
};
exports.RESULT_TYPES = 
// Need to cast as keys return string[] by default
Object.keys(exports.DEFAULT_RESULT_INDEX);
//# sourceMappingURL=index.js.map