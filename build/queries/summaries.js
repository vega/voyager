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
var encoding_1 = require("compassql/build/src/query/encoding");
var common_1 = require("./common");
exports.summaries = {
    type: 'summaries',
    title: 'Related Summaries',
    filterSpecifiedView: true,
    createQuery: function (query) {
        var spec = query.spec;
        var newSpec = __assign({}, spec, { mark: common_1.makeWildcard(spec.mark), encodings: spec.encodings.reduce(function (encodings, encQ) {
                if (encoding_1.isFieldQuery(encQ)) {
                    switch (encQ.type) {
                        case 'quantitative':
                            if (encQ.aggregate === 'count') {
                                // Skip count, so that it can be added back as autoCount or omitted
                                return encodings;
                            }
                            else {
                                // For other Q, it should be either aggregate or binned
                                return encodings.concat(__assign({}, encQ, { aggregate: common_1.makeWildcard(encQ.aggregate), bin: common_1.makeWildcard(encQ.bin), hasFn: true }));
                            }
                        case 'temporal':
                            // TODO: only year and periodic timeUnit
                            return encodings.concat(__assign({}, encQ, { timeUnit: common_1.makeWildcard(encQ.timeUnit) }));
                        case 'nominal':
                        case 'ordinal':
                        case 'key':
                            return encodings.concat(encQ);
                    }
                    throw new Error('Unsupported type in related summaries query creator.');
                }
                return encodings;
            }, []) });
        // TODO: extend config
        return {
            spec: newSpec,
            groupBy: 'fieldTransform',
            // fieldOrder should be the same, since we have similar fields
            orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
            // aggregationQuality should be the same with group with similar transform
            chooseBy: ['aggregationQuality', 'effectiveness'],
            config: {
                autoAddCount: true,
                omitRaw: true
            }
        };
    }
};
//# sourceMappingURL=summaries.js.map