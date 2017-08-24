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
var timeunit_1 = require("vega-lite/build/src/timeunit");
var actions_1 = require("../../actions");
var shelf_1 = require("../../models/shelf");
var filter_1 = require("./filter");
var rangeFilter = { field: 'q1', range: [1437978615, 1501137015] };
// 1437978615: Sat Jan 17 1970 07:26:18 GMT-0800 (PST);
// 1501137015: Sun Jan 18 1970 00:58:57 GMT-0800 (PST)
var oneOfFilter = { field: 'q2', oneOf: ['a', 'c'] };
var rangeFilter2 = { field: 'q3', range: [1437978615, 1501137015] };
var noFilterSpec = __assign({}, shelf_1.DEFAULT_SHELF_UNIT_SPEC, { filters: [] });
var simpleSpec = __assign({}, shelf_1.DEFAULT_SHELF_UNIT_SPEC, { filters: [rangeFilter, oneOfFilter] });
var schema = new schema_1.Schema({ fields: [
        {
            name: 'q1',
            vlType: 'temporal',
            type: 'datetime',
            stats: {
                distinct: 2,
                max: 1501137015,
                min: 1437978615
            }
        },
        {
            name: 'q2',
            vlType: 'nominal',
            type: 'string',
            stats: {
                distinct: 2
            }
        }
    ] });
describe('reducers/shelf/filter', function () {
    describe(actions_1.FILTER_ADD, function () {
        it('should return a filter array containing one range filter', function () {
            var spec = filter_1.filterReducer(noFilterSpec, {
                type: actions_1.FILTER_ADD,
                payload: {
                    filter: rangeFilter,
                    index: 0
                }
            }, schema);
            expect(spec.filters).toEqual([rangeFilter]);
        });
    });
    describe(actions_1.FILTER_ADD, function () {
        it('should add the given filter at the end of the array', function () {
            var spec = filter_1.filterReducer(simpleSpec, {
                type: actions_1.FILTER_ADD,
                payload: {
                    filter: rangeFilter2,
                }
            }, schema);
            expect(spec.filters).toEqual([rangeFilter, oneOfFilter, rangeFilter2]);
        });
    });
    describe(actions_1.FILTER_CLEAR, function () {
        it('should clear all filters', function () {
            var spec = filter_1.filterReducer(simpleSpec, {
                type: actions_1.FILTER_CLEAR
            }, schema);
            expect(spec.filters.length).toEqual(0);
        });
    });
    describe(actions_1.FILTER_REMOVE, function () {
        it('should remove the range filter at the given index and return a filter arry', function () {
            var spec = filter_1.filterReducer(simpleSpec, {
                type: actions_1.FILTER_REMOVE,
                payload: {
                    index: 0
                }
            }, schema);
            expect(spec.filters).toEqual([oneOfFilter]);
        });
    });
    describe(actions_1.FILTER_MODIFY_EXTENT, function () {
        it('should modify the min bound and the max bound of the filter at the given index', function () {
            var spec = filter_1.filterReducer(simpleSpec, {
                type: actions_1.FILTER_MODIFY_EXTENT,
                payload: {
                    index: 0,
                    range: [100, 1000]
                }
            }, schema);
            expect(spec.filters).toEqual([
                { field: 'q1', range: [100, 1000] }, oneOfFilter
            ]);
        });
    });
    describe(actions_1.FILTER_MODIFY_MAX_BOUND, function () {
        it('should modify the max bound of the filter at the given index', function () {
            var spec = filter_1.filterReducer(simpleSpec, {
                type: actions_1.FILTER_MODIFY_MAX_BOUND,
                payload: {
                    index: 0,
                    maxBound: 1437978616,
                }
            }, schema);
            expect(spec.filters).toEqual([
                { field: 'q1', range: [1437978615, 1437978616] }, oneOfFilter
            ]);
        });
    });
    describe(actions_1.FILTER_MODIFY_MIN_BOUND, function () {
        it('should modify the min bound of the filter at the given index', function () {
            var spec = filter_1.filterReducer(simpleSpec, {
                type: actions_1.FILTER_MODIFY_MIN_BOUND,
                payload: {
                    index: 0,
                    minBound: -100,
                }
            }, schema);
            expect(spec.filters).toEqual([
                { field: 'q1', range: [-100, 1501137015] }, oneOfFilter
            ]);
        });
    });
    describe(actions_1.FILTER_MODIFY_ONE_OF, function () {
        it('should clear the oneof array of the filter at the given index', function () {
            var spec = filter_1.filterReducer(simpleSpec, {
                type: actions_1.FILTER_MODIFY_ONE_OF,
                payload: {
                    index: 1,
                    oneOf: []
                }
            }, schema);
            expect(spec.filters).toEqual([
                rangeFilter, { field: 'q2', oneOf: [] }
            ]);
        });
    });
    describe(actions_1.FILTER_MODIFY_ONE_OF, function () {
        it('should add an item in the oneof array of the filter at the given index', function () {
            var spec = filter_1.filterReducer(simpleSpec, {
                type: actions_1.FILTER_MODIFY_ONE_OF,
                payload: {
                    index: 1,
                    oneOf: ['a', 'b', 'c']
                }
            }, schema);
            expect(spec.filters).toEqual([
                rangeFilter, { field: 'q2', oneOf: ['a', 'b', 'c'] }
            ]);
        });
    });
    describe(actions_1.FILTER_MODIFY_TIME_UNIT, function () {
        it('should add a time unit to the range filter', function () {
            var spec = filter_1.filterReducer(simpleSpec, {
                type: actions_1.FILTER_MODIFY_TIME_UNIT,
                payload: {
                    index: 0,
                    timeUnit: timeunit_1.TimeUnit.YEAR
                }
            }, schema);
            expect(spec.filters).toEqual([
                { field: 'q1', range: [1970, 1970], timeUnit: timeunit_1.TimeUnit.YEAR }, oneOfFilter
            ]);
        });
    });
    it('should add a time unit to the one of filter', function () {
        var spec = filter_1.filterReducer(simpleSpec, {
            type: actions_1.FILTER_MODIFY_TIME_UNIT,
            payload: {
                index: 1,
                timeUnit: timeunit_1.TimeUnit.DAY
            }
        }, schema);
        expect(spec.filters).toEqual([
            rangeFilter, { field: 'q2', oneOf: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                timeUnit: timeunit_1.TimeUnit.DAY }
        ]);
    });
});
//# sourceMappingURL=filter.test.js.map