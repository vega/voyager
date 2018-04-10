"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("compassql/build/src/wildcard");
var histograms_1 = require("./histograms");
describe('queries/histogram', function () {
    it('should correctly produce a query', function () {
        var query = {
            spec: {
                transform: [{
                        filter: {
                            field: 'a',
                            oneOf: ['1, 2']
                        }
                    }],
                mark: 'point',
                encodings: []
            }
        };
        expect(histograms_1.histograms.createQuery(query)).toEqual({
            spec: {
                transform: [{
                        filter: {
                            field: 'a',
                            oneOf: ['1, 2']
                        }
                    }],
                mark: wildcard_1.SHORT_WILDCARD,
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
            orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
            chooseBy: ['aggregationQuality', 'effectiveness'],
            config: { autoAddCount: false }
        });
    });
});
//# sourceMappingURL=histograms.test.js.map