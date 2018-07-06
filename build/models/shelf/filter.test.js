"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var filter_1 = require("./filter");
var filter_2 = require("./filter");
var filter_3 = require("./filter");
var timeStamp1 = 1437978615;
var timeStamp2 = 1501137015;
// 1437978615: Sat Jan 17 1970 07:26:18:615 GMT-0800 (PST);
// 1501137015: Sun Jan 18 1970 00:58:57:15 GMT-0800 (PST);
var dateTime1 = {
    year: 1970,
    quarter: 1,
    month: 1,
    date: 17,
    hours: 7,
    minutes: 26,
    seconds: 18,
    milliseconds: 615,
    utc: false
};
var dateTime2 = {
    year: 1970,
    quarter: 1,
    month: 1,
    date: 18,
    hours: 0,
    minutes: 58,
    seconds: 57,
    milliseconds: 15,
    utc: false
};
describe('models/shelf/filter', function () {
    describe('createDefaultFilter', function () {
        it('should return a range filter for quantitative field', function () {
            var fieldDef = { field: 'q1', type: 'quantitative' };
            var domain = [1437978615, 1501137015];
            var filter = filter_1.createDefaultFilter(fieldDef, domain);
            expect(filter).toEqual({ field: 'q1', range: domain });
        });
        it('should return a range filter for temporal field', function () {
            var fieldDef = { field: 'q1', type: 'temporal' };
            var domain = [1437978615, 1501137015];
            var filter = filter_1.createDefaultFilter(fieldDef, domain);
            expect(filter).toEqual({ timeUnit: 'year', field: 'q1', range: [1970, 1970] });
        });
        it('should return a oneof filter for temporal field with year', function () {
            var fieldDef = { fn: 'year', field: 'q1', type: 'temporal' };
            var domain = [1437978615, 1501137015];
            var filter = filter_1.createDefaultFilter(fieldDef, domain);
            expect(filter).toEqual({ timeUnit: 'year', field: 'q1', range: [1970, 1970] });
        });
    });
    describe('getAllTimeUnits', function () {
        it('should return all supported time unit', function () {
            expect(filter_1.getAllTimeUnits().sort()).toEqual([
                'year', 'yearmonthdate', 'quarter', 'month', 'date', 'day', 'hours',
                'minutes', 'seconds', 'milliseconds'
            ].sort());
        });
    });
    describe('getDefaultTimeRange', function () {
        it('should return the range in year', function () {
            expect(filter_1.getDefaultTimeRange([timeStamp1, timeStamp2], 'year')).toEqual([1970, 1970]);
        });
        describe('should return the range in YearMonthDate', function () {
            expect(filter_1.getDefaultTimeRange([timeStamp1, timeStamp2], 'yearmonthdate')).toEqual([
                {
                    year: 1970,
                    quarter: 1,
                    month: 1,
                    date: 17,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0,
                    utc: false
                },
                {
                    year: 1970,
                    quarter: 1,
                    month: 1,
                    date: 18,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    milliseconds: 0,
                    utc: false
                }
            ]);
        });
    });
    describe('getDefaultList', function () {
        it('should return 7 days in the list', function () {
            expect(filter_1.getDefaultList('day')).toEqual([
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
            ]);
        });
    });
    describe('convertToDateTimeObject', function () {
        it('should return a dateTime object of the given timeStamp', function () {
            expect(filter_1.convertToDateTimeObject(timeStamp1)).toEqual(dateTime1);
        });
    });
    describe('convertToTimestamp', function () {
        it('should return a timestamp of the given dateTime object', function () {
            expect(filter_1.convertToTimestamp(dateTime2)).toEqual(timeStamp2);
        });
    });
    describe('filterHasField', function () {
        it('should return whether filters contain the given filter', function () {
            var filters = [{
                    field: 'q1',
                    range: [0, 100]
                }, {
                    field: 'q2',
                    range: [0, 1000]
                }];
            expect(filter_2.filterHasField(filters, 'q1')).toEqual(true);
        });
    });
    describe('toPredicateFunction', function () {
        it('creates an expression function for a  oneOf filter', function () {
            var fn = filter_3.toPredicateFunction([{ field: 'a', oneOf: [1, 2] }]);
            expect(fn({ a: 1 })).toEqual(true);
            expect(fn({ a: 3 })).toEqual(false);
        });
        it('creates an expression function for a range filter', function () {
            var fn = filter_3.toPredicateFunction([{ field: 'a', range: [1, 2] }]);
            expect(fn({ a: 1 })).toEqual(true);
            expect(fn({ a: 3 })).toEqual(false);
        });
    });
});
//# sourceMappingURL=filter.test.js.map