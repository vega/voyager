"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("compassql/build/src/wildcard");
exports.histograms = {
    type: 'histograms',
    title: 'Univariate Summaries',
    filterSpecifiedView: undefined,
    createQuery: function (query) {
        return {
            spec: {
                data: query.spec.data,
                mark: wildcard_1.SHORT_WILDCARD,
                transform: query.spec.transform,
                encodings: [
                    {
                        channel: wildcard_1.SHORT_WILDCARD,
                        bin: wildcard_1.SHORT_WILDCARD, timeUnit: wildcard_1.SHORT_WILDCARD,
                        field: wildcard_1.SHORT_WILDCARD,
                        type: wildcard_1.SHORT_WILDCARD
                    },
                    {
                        channel: wildcard_1.SHORT_WILDCARD,
                        aggregate: 'count',
                        field: '*',
                        type: 'quantitative'
                    }
                ]
            },
            groupBy: 'fieldTransform',
            // FieldOrder should dominates everything else
            orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
            // aggregationQuality should be the same
            chooseBy: ['aggregationQuality', 'effectiveness'],
            config: { autoAddCount: false }
        };
    }
};
//# sourceMappingURL=histograms.js.map