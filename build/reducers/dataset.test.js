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
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var schema_1 = require("compassql/build/src/schema");
var dataset_1 = require("../actions/dataset");
var dataset_2 = require("../models/dataset");
var dataset_3 = require("./dataset");
describe('reducers/dataset', function () {
    describe(dataset_1.DATASET_REQUEST, function () {
        it('returns new dataset state with isLoading = true', function () {
            expect(dataset_3.datasetReducer(dataset_2.DEFAULT_DATASET, {
                type: dataset_1.DATASET_REQUEST,
                payload: {
                    name: 'cars',
                    url: 'http://cars.com'
                }
            })).toEqual(__assign({}, dataset_2.DEFAULT_DATASET, { isLoading: true }));
        });
    });
    describe(dataset_1.DATASET_RECEIVE, function () {
        it('accepts inline data and returns new dataset state with isLoading=false and new name, data, and schema', function () {
            var data = {
                values: [
                    { "a": "A", "b": 28 }, { "a": "B", "b": 55 }, { "a": "C", "b": 43 },
                    { "a": "D", "b": 91 }, { "a": "E", "b": 81 }, { "a": "F", "b": 53 },
                    { "a": "G", "b": 19 }, { "a": "H", "b": 87 }, { "a": "I", "b": 52 }
                ]
            };
            var schema = new schema_1.Schema({ fields: [] });
            expect(dataset_3.datasetReducer(__assign({}, dataset_2.DEFAULT_DATASET, { isLoading: true }), {
                type: dataset_1.DATASET_RECEIVE,
                payload: {
                    name: 'Custom Data',
                    data: data,
                    schema: schema
                }
            })).toEqual(__assign({}, dataset_2.DEFAULT_DATASET, { isLoading: false, name: 'Custom Data', data: data,
                schema: schema }));
        });
    });
    describe(dataset_1.DATASET_SCHEMA_CHANGE_FIELD_TYPE, function () {
        it('returns updated field schema with vlType changed', function () {
            var data = {
                values: [
                    { q1: 1 },
                    { q1: 100 }
                ]
            };
            var simpleDataset = {
                isLoading: false,
                name: 'Test',
                schema: new schema_1.Schema({ fields: [{
                            name: 'q1',
                            vlType: 'quantitative',
                            type: 'number',
                            stats: {
                                distinct: 2
                            }
                        }] }),
                data: data
            };
            var changedSchema = new schema_1.Schema({ fields: [{
                        name: 'q1',
                        vlType: 'nominal',
                        type: 'number',
                        stats: {
                            distinct: 2
                        }
                    }]
            });
            expect(dataset_3.datasetReducer(simpleDataset, {
                type: dataset_1.DATASET_SCHEMA_CHANGE_FIELD_TYPE,
                payload: {
                    field: 'q1',
                    type: expandedtype_1.ExpandedType.NOMINAL
                }
            })).toEqual(__assign({}, simpleDataset, { schema: changedSchema }));
        });
    });
    describe(dataset_1.DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN, function () {
        it('returns updated field schema with ordinalDomain changed', function () {
            var data = {
                values: [
                    { o: 'A' },
                    { o: 'B' }
                ]
            };
            var simpleDataset = {
                isLoading: false,
                name: 'Test',
                schema: new schema_1.Schema({ fields: [{
                            name: 'o',
                            vlType: 'ordinal',
                            type: 'string',
                            stats: {
                                distinct: 2
                            }
                        }] }),
                data: data
            };
            var changedSchema = new schema_1.Schema({ fields: [{
                        name: 'o',
                        ordinalDomain: ['B', 'A'],
                        vlType: 'ordinal',
                        type: 'string',
                        stats: {
                            distinct: 2
                        }
                    }]
            });
            expect(dataset_3.datasetReducer(simpleDataset, {
                type: dataset_1.DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN,
                payload: {
                    field: 'o',
                    domain: ['B', 'A']
                }
            })).toEqual(__assign({}, simpleDataset, { schema: changedSchema }));
        });
    });
});
//# sourceMappingURL=dataset.test.js.map