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
var wildcard_1 = require("compassql/build/src/wildcard");
function makeFieldSuggestionQueryCreator(params) {
    var type = params.type, title = params.title, additionalFieldQuery = params.additionalFieldQuery;
    return {
        type: type,
        title: title,
        filterSpecifiedView: undefined,
        createQuery: function (query) {
            return {
                spec: __assign({}, query.spec, { encodings: query.spec.encodings.concat([
                        additionalFieldQuery
                    ]) }),
                groupBy: 'field',
                // FieldOrder should dominates everything else
                orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
                // aggregationQuality should be the same
                chooseBy: ['aggregationQuality', 'effectiveness'],
                config: { autoAddCount: true }
            };
        }
    };
}
exports.addCategoricalField = makeFieldSuggestionQueryCreator({
    type: 'addCategoricalField',
    title: 'Add Categorical Field',
    additionalFieldQuery: {
        channel: wildcard_1.SHORT_WILDCARD,
        field: wildcard_1.SHORT_WILDCARD,
        type: 'nominal',
        description: 'Categorical Fields'
    }
});
exports.addQuantitativeField = makeFieldSuggestionQueryCreator({
    type: 'addQuantitativeField',
    title: 'Add Quantitative Field',
    additionalFieldQuery: {
        channel: wildcard_1.SHORT_WILDCARD,
        bin: wildcard_1.SHORT_WILDCARD,
        aggregate: wildcard_1.SHORT_WILDCARD,
        field: wildcard_1.SHORT_WILDCARD,
        type: 'quantitative',
        description: 'Quantitative Fields'
    }
});
exports.addTemporalField = makeFieldSuggestionQueryCreator({
    type: 'addTemporalField',
    title: 'Add Temporal Field',
    additionalFieldQuery: {
        channel: wildcard_1.SHORT_WILDCARD,
        hasFn: true,
        timeUnit: wildcard_1.SHORT_WILDCARD,
        field: wildcard_1.SHORT_WILDCARD,
        type: 'temporal',
        description: 'Temporal Fields'
    }
});
//# sourceMappingURL=field-suggestions.js.map