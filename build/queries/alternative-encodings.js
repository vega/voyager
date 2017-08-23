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
var common_1 = require("./common");
exports.alternativeEncodings = {
    type: 'alternativeEncodings',
    title: 'Alternative Encodings',
    filterSpecifiedView: true,
    createQuery: function (query) {
        var spec = query.spec;
        var mark = spec.mark, encodings = spec.encodings;
        return {
            spec: __assign({}, query.spec, { mark: common_1.makeWildcard(mark), encodings: encodings.map(function (encQ) {
                    if (wildcard_1.isWildcard(encQ.channel)) {
                        return encQ;
                    }
                    return __assign({}, encQ, { channel: wildcard_1.SHORT_WILDCARD });
                }) }),
            groupBy: 'encoding',
            // fieldOrder, aggregationQuality should be the same, since we have similar fields and aggregates
            orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
            chooseBy: ['aggregationQuality', 'effectiveness']
        };
    }
};
//# sourceMappingURL=alternative-encodings.js.map