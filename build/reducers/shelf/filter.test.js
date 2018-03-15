"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var timeunit_1 = require("vega-lite/build/src/timeunit");
var actions_1 = require("../../actions");
var filter_1 = require("../../actions/shelf/filter");
var filter_2 = require("../../models/shelf/filter");
var filter_3 = require("./filter");
var range = [1437978615, 1501137015];
// 1437978615: Sat Jan 17 1970 07:26:18 GMT-0800 (PST);
// 1501137015: Sun Jan 18 1970 00:58:57 GMT-0800 (PST)
var rangeFilter = { field: 'q1', range: range };
var oneOfFilter = { field: 'q2', oneOf: ['a', 'c'] };
var simpleFilters = [rangeFilter, oneOfFilter];
describe('reducers/shelf/filter', function () {
    describe(actions_1.FILTER_ADD, function () {
        it('should return a filter array containing one range filter', function () {
            var noFilters = [];
            var filters = filter_3.filterReducer(noFilters, {
                type: actions_1.FILTER_ADD,
                payload: {
                    filter: rangeFilter,
                    index: 0
                }
            });
            expect(filters).toEqual([rangeFilter]);
        });
    });
    describe(actions_1.FILTER_ADD, function () {
        it('should add the given filter at the end of the array', function () {
            var rangeFilter2 = { field: 'q3', range: range };
            var filters = filter_3.filterReducer(simpleFilters, {
                type: actions_1.FILTER_ADD,
                payload: {
                    filter: rangeFilter2,
                }
            });
            expect(filters).toEqual([rangeFilter, oneOfFilter, rangeFilter2]);
        });
    });
    describe(filter_1.FILTER_TOGGLE, function () {
        it('should add the given filter when toggled', function () {
            var filter = {
                field: 'q3',
                range: [0, 100]
            };
            var filters = filter_3.filterReducer(simpleFilters, {
                type: filter_1.FILTER_TOGGLE,
                payload: {
                    filter: filter
                }
            });
            expect(filters).toEqual([rangeFilter, oneOfFilter, filter]);
        });
        it('should remove the given filter when toggled', function () {
            var filters = filter_3.filterReducer(simpleFilters, {
                type: filter_1.FILTER_TOGGLE,
                payload: {
                    filter: rangeFilter
                }
            });
            expect(filters).toEqual([oneOfFilter]);
        });
    });
    describe(actions_1.FILTER_CLEAR, function () {
        it('should clear all filters', function () {
            var filters = filter_3.filterReducer(simpleFilters, {
                type: actions_1.FILTER_CLEAR
            });
            expect(filters.length).toEqual(0);
        });
    });
    describe(actions_1.FILTER_REMOVE, function () {
        it('should remove the range filter at the given index and return a filter arry', function () {
            var filters = filter_3.filterReducer(simpleFilters, {
                type: actions_1.FILTER_REMOVE,
                payload: {
                    index: 0
                }
            });
            expect(filters).toEqual([oneOfFilter]);
        });
    });
    describe(actions_1.FILTER_MODIFY_EXTENT, function () {
        it('should modify the min bound and the max bound of the filter at the given index', function () {
            var filters = filter_3.filterReducer(simpleFilters, {
                type: actions_1.FILTER_MODIFY_EXTENT,
                payload: {
                    index: 0,
                    range: [100, 1000]
                }
            });
            expect(filters).toEqual([
                { field: 'q1', range: [100, 1000] }, oneOfFilter
            ]);
        });
    });
    describe(actions_1.FILTER_MODIFY_MAX_BOUND, function () {
        it('should modify the max bound of the filter at the given index', function () {
            var filters = filter_3.filterReducer(simpleFilters, {
                type: actions_1.FILTER_MODIFY_MAX_BOUND,
                payload: {
                    index: 0,
                    maxBound: 1437978616,
                }
            });
            expect(filters).toEqual([
                { field: 'q1', range: [1437978615, 1437978616] }, oneOfFilter
            ]);
        });
    });
    describe(actions_1.FILTER_MODIFY_MIN_BOUND, function () {
        it('should modify the min bound of the filter at the given index', function () {
            var filters = filter_3.filterReducer(simpleFilters, {
                type: actions_1.FILTER_MODIFY_MIN_BOUND,
                payload: {
                    index: 0,
                    minBound: -100,
                }
            });
            expect(filters).toEqual([
                { field: 'q1', range: [-100, 1501137015] }, oneOfFilter
            ]);
        });
    });
    describe(actions_1.FILTER_MODIFY_ONE_OF, function () {
        it('should clear the oneof array of the filter at the given index', function () {
            var filters = filter_3.filterReducer(simpleFilters, {
                type: actions_1.FILTER_MODIFY_ONE_OF,
                payload: {
                    index: 1,
                    oneOf: []
                }
            });
            expect(filters).toEqual([
                rangeFilter, { field: 'q2', oneOf: [] }
            ]);
        });
    });
    describe(actions_1.FILTER_MODIFY_ONE_OF, function () {
        it('should add an item in the oneof array of the filter at the given index', function () {
            var filters = filter_3.filterReducer(simpleFilters, {
                type: actions_1.FILTER_MODIFY_ONE_OF,
                payload: {
                    index: 1,
                    oneOf: ['a', 'b', 'c']
                }
            });
            expect(filters).toEqual([
                rangeFilter, { field: 'q2', oneOf: ['a', 'b', 'c'] }
            ]);
        });
    });
    describe(actions_1.FILTER_MODIFY_TIME_UNIT, function () {
        it('should add a time unit to the range filter', function () {
            var filters = filter_3.filterReducer(simpleFilters, {
                type: actions_1.FILTER_MODIFY_TIME_UNIT,
                payload: {
                    index: 0,
                    domain: range,
                    timeUnit: timeunit_1.TimeUnit.YEAR
                }
            });
            expect(filters).toEqual([
                { field: 'q1', range: [1970, 1970], timeUnit: timeunit_1.TimeUnit.YEAR }, oneOfFilter
            ]);
        });
    });
    it('should add a time unit to the one of filter', function () {
        var filters = filter_3.filterReducer(simpleFilters, {
            type: actions_1.FILTER_MODIFY_TIME_UNIT,
            payload: {
                index: 1,
                domain: range,
                timeUnit: timeunit_1.TimeUnit.DAY
            }
        });
        expect(filters).toEqual([
            rangeFilter, { field: 'q2', oneOf: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                timeUnit: timeunit_1.TimeUnit.DAY }
        ]);
    });
    it('should remove the time unit of a filter', function () {
        var filters = filter_3.filterReducer(simpleFilters, {
            type: actions_1.FILTER_MODIFY_TIME_UNIT,
            payload: {
                index: 0,
                domain: range,
                timeUnit: undefined
            }
        });
        expect(filters).toEqual([
            { field: 'q1', range: [filter_2.convertToDateTimeObject(range[0]), filter_2.convertToDateTimeObject(range[1])], timeUnit: undefined },
            oneOfFilter
        ]);
    });
});
//# sourceMappingURL=filter.test.js.map