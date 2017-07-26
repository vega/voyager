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
var filter_1 = require("../../actions/filter");
var shelf_1 = require("../../models/shelf");
var filter_2 = require("./filter");
var rangeFilter = { field: 'q1', range: [0, 1] };
var oneOfFilter = { field: 'q2', oneOf: ['a', 'c'] };
var noFilterSpec = __assign({}, shelf_1.DEFAULT_SHELF_UNIT_SPEC, { filters: [] });
var simpleSpec = __assign({}, shelf_1.DEFAULT_SHELF_UNIT_SPEC, { filters: [rangeFilter, oneOfFilter] });
describe('reducers/shelf/filter', function () {
    describe(filter_1.FILTER_ADD, function () {
        it('should return a filter array containing one range filter', function () {
            var spec = filter_2.filterReducer(noFilterSpec, {
                type: filter_1.FILTER_ADD,
                payload: {
                    filter: rangeFilter,
                    index: 0
                }
            });
            expect(spec.filters).toEqual([rangeFilter]);
        });
    });
    describe(filter_1.FILTER_REMOVE, function () {
        it('should remove the range filter at the given index and return a filter arry', function () {
            var spec = filter_2.filterReducer(simpleSpec, {
                type: filter_1.FILTER_REMOVE,
                payload: {
                    index: 0
                }
            });
            expect(spec.filters).toEqual([oneOfFilter]);
        });
    });
    describe(filter_1.FILTER_MODIFY_MAX_BOUND, function () {
        it('should modify the max bound of the filter at the given index', function () {
            var spec = filter_2.filterReducer(simpleSpec, {
                type: filter_1.FILTER_MODIFY_MAX_BOUND,
                payload: {
                    index: 0,
                    maxBound: 100,
                }
            });
            expect(spec.filters).toEqual([
                { field: 'q1', range: [0, 100] }, oneOfFilter
            ]);
        });
    });
    describe(filter_1.FILTER_MODIFY_MIN_BOUND, function () {
        it('should modify the min bound of the filter at the given index', function () {
            var spec = filter_2.filterReducer(simpleSpec, {
                type: filter_1.FILTER_MODIFY_MIN_BOUND,
                payload: {
                    index: 0,
                    minBound: -100,
                }
            });
            expect(spec.filters).toEqual([
                { field: 'q1', range: [-100, 1] }, oneOfFilter
            ]);
        });
    });
    describe(filter_1.FILTER_MODIFY_ONE_OF, function () {
        it('should clear the oneof array of the filter at the given index', function () {
            var spec = filter_2.filterReducer(simpleSpec, {
                type: filter_1.FILTER_MODIFY_ONE_OF,
                payload: {
                    index: 1,
                    oneOf: []
                }
            });
            expect(spec.filters).toEqual([
                rangeFilter, { field: 'q2', oneOf: [] }
            ]);
        });
    });
    describe(filter_1.FILTER_MODIFY_ONE_OF, function () {
        it('should add an item in the oneof array of the filter at the given index', function () {
            var spec = filter_2.filterReducer(simpleSpec, {
                type: filter_1.FILTER_MODIFY_ONE_OF,
                payload: {
                    index: 1,
                    oneOf: ['a', 'b', 'c']
                }
            });
            expect(spec.filters).toEqual([
                rangeFilter, { field: 'q2', oneOf: ['a', 'b', 'c'] }
            ]);
        });
    });
});
