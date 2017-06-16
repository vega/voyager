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
var schema_1 = require("compassql/build/src/schema");
var dataset_1 = require("../actions/dataset");
var dataset_2 = require("../models/dataset");
var dataset_3 = require("./dataset");
describe('reducers/dataset', function () {
    describe(dataset_1.DATASET_URL_REQUEST, function () {
        it('returns new dataset state with isLoading = true', function () {
            expect(dataset_3.datasetReducer(dataset_2.DEFAULT_DATASET, {
                type: dataset_1.DATASET_URL_REQUEST,
                payload: {
                    name: 'cars',
                    url: 'http://cars.com'
                }
            })).toEqual(__assign({}, dataset_2.DEFAULT_DATASET, { isLoading: true }));
        });
    });
    describe(dataset_1.DATASET_URL_RECEIVE, function () {
        it('returns new dataset state with isLoading=false and with new name, data, and schema', function () {
            var url = 'http://cars.com';
            var schema = new schema_1.Schema({ fields: [] });
            expect(dataset_3.datasetReducer(__assign({}, dataset_2.DEFAULT_DATASET, { isLoading: true }), {
                type: dataset_1.DATASET_URL_RECEIVE,
                payload: {
                    name: 'cars',
                    url: url,
                    schema: schema
                }
            })).toEqual(__assign({}, dataset_2.DEFAULT_DATASET, { isLoading: false, name: 'cars', data: { url: url }, schema: schema }));
        });
    });
    describe(dataset_1.DATASET_INLINE_RECEIVE, function () {
        it('returns new dataset state with isLoading=false and with new name, data, and schema', function () {
            var data = {
                values: [
                    { "a": "A", "b": 28 }, { "a": "B", "b": 55 }, { "a": "C", "b": 43 },
                    { "a": "D", "b": 91 }, { "a": "E", "b": 81 }, { "a": "F", "b": 53 },
                    { "a": "G", "b": 19 }, { "a": "H", "b": 87 }, { "a": "I", "b": 52 }
                ]
            };
            var schema = new schema_1.Schema({ fields: [] });
            expect(dataset_3.datasetReducer(__assign({}, dataset_2.DEFAULT_DATASET, { isLoading: true }), {
                type: dataset_1.DATASET_INLINE_RECEIVE,
                payload: {
                    name: 'Custom Data',
                    data: data,
                    schema: schema
                }
            })).toEqual(__assign({}, dataset_2.DEFAULT_DATASET, { isLoading: false, name: 'Custom Data', data: data,
                schema: schema }));
        });
    });
});
