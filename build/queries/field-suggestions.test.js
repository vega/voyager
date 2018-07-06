"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("compassql/build/src/wildcard");
var field_suggestions_1 = require("./field-suggestions");
describe('queries/field-suggestions', function () {
    describe('addQuantitativeField', function () {
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
            expect(field_suggestions_1.addQuantitativeField.createQuery(query)).toEqual({
                spec: {
                    transform: [{
                            filter: {
                                field: 'a',
                                oneOf: ['1, 2']
                            }
                        }],
                    mark: 'point',
                    encodings: [{
                            channel: wildcard_1.SHORT_WILDCARD,
                            bin: wildcard_1.SHORT_WILDCARD,
                            aggregate: wildcard_1.SHORT_WILDCARD,
                            field: wildcard_1.SHORT_WILDCARD,
                            type: 'quantitative',
                            description: 'Quantitative Fields'
                        }]
                },
                groupBy: 'field',
                orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
                chooseBy: ['aggregationQuality', 'effectiveness'],
                config: { autoAddCount: true }
            });
        });
    });
    describe('addTemporalField', function () {
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
            expect(field_suggestions_1.addTemporalField.createQuery(query)).toEqual({
                spec: {
                    transform: [{
                            filter: {
                                field: 'a',
                                oneOf: ['1, 2']
                            }
                        }],
                    mark: 'point',
                    encodings: [{
                            channel: wildcard_1.SHORT_WILDCARD,
                            timeUnit: wildcard_1.SHORT_WILDCARD,
                            hasFn: true,
                            field: wildcard_1.SHORT_WILDCARD,
                            type: 'temporal',
                            description: 'Temporal Fields'
                        }]
                },
                groupBy: 'field',
                orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
                chooseBy: ['aggregationQuality', 'effectiveness'],
                config: { autoAddCount: true }
            });
        });
    });
    describe('addCategoricalField', function () {
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
            expect(field_suggestions_1.addCategoricalField.createQuery(query)).toEqual({
                spec: {
                    transform: [{
                            filter: {
                                field: 'a',
                                oneOf: ['1, 2']
                            }
                        }],
                    mark: 'point',
                    encodings: [{
                            channel: wildcard_1.SHORT_WILDCARD,
                            field: wildcard_1.SHORT_WILDCARD,
                            type: 'nominal',
                            description: 'Categorical Fields'
                        }]
                },
                groupBy: 'field',
                orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
                chooseBy: ['aggregationQuality', 'effectiveness'],
                config: { autoAddCount: true }
            });
        });
    });
});
//# sourceMappingURL=field-suggestions.test.js.map