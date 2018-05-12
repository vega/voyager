"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("compassql/build/src/wildcard");
var summaries_1 = require("./summaries");
describe('queries/summaries', function () {
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
                encodings: [{
                        channel: 'y',
                        field: 'a',
                        type: 'quantitative'
                    }, {
                        channel: 'color',
                        field: 'b',
                        type: 'nominal'
                    }, {
                        channel: 'x',
                        field: 'c',
                        type: 'temporal'
                    }]
            }
        };
        expect(summaries_1.summaries.createQuery(query)).toEqual({
            spec: {
                transform: [{
                        filter: {
                            field: 'a',
                            oneOf: ['1, 2']
                        }
                    }],
                mark: wildcard_1.SHORT_WILDCARD,
                encodings: [{
                        channel: 'y',
                        bin: wildcard_1.SHORT_WILDCARD,
                        aggregate: wildcard_1.SHORT_WILDCARD,
                        hasFn: true,
                        field: 'a',
                        type: 'quantitative'
                    }, {
                        channel: 'color',
                        field: 'b',
                        type: 'nominal'
                    }, {
                        channel: 'x',
                        timeUnit: wildcard_1.SHORT_WILDCARD,
                        field: 'c',
                        type: 'temporal'
                    }]
            },
            groupBy: 'fieldTransform',
            orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
            chooseBy: ['aggregationQuality', 'effectiveness'],
            config: { autoAddCount: true, omitRaw: true }
        });
    });
});
//# sourceMappingURL=summaries.test.js.map