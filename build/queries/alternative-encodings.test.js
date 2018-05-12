"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("compassql/build/src/wildcard");
var alternative_encodings_1 = require("./alternative-encodings");
describe('queries/alternative-encodings', function () {
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
        expect(alternative_encodings_1.alternativeEncodings.createQuery(query)).toEqual({
            spec: {
                transform: [{
                        filter: {
                            field: 'a',
                            oneOf: ['1, 2']
                        }
                    }],
                mark: wildcard_1.SHORT_WILDCARD,
                encodings: [{
                        channel: wildcard_1.SHORT_WILDCARD,
                        field: 'a',
                        type: 'quantitative'
                    }, {
                        channel: wildcard_1.SHORT_WILDCARD,
                        field: 'b',
                        type: 'nominal'
                    }, {
                        channel: wildcard_1.SHORT_WILDCARD,
                        field: 'c',
                        type: 'temporal'
                    }]
            },
            groupBy: 'encoding',
            orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
            chooseBy: ['aggregationQuality', 'effectiveness']
        });
    });
});
//# sourceMappingURL=alternative-encodings.test.js.map