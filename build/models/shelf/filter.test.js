"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var filter_1 = require("./filter");
var timeStamp1 = 1437978615;
var timeStamp2 = 1501137015;
// 1437978615: Sat Jan 17 1970 07:26:18:615 GMT-0800 (PST);
// 1501137015: Sun Jan 18 1970 00:58:57:15 GMT-0800 (PST);
var rangeFilter = { field: 'q1', range: [timeStamp1, timeStamp2] };
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
    describe('getFilter', function () {
        it('should return a range filter', function () {
            var fieldDef = { field: 'q1', type: 'quantitative' };
            var domain = [1437978615, 1501137015];
            var filter = filter_1.getFilter(fieldDef, domain);
            expect(filter).toEqual(rangeFilter);
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
    describe('getDefaultRange', function () {
        it('should return the range in year', function () {
            expect(filter_1.getDefaultRange([timeStamp1, timeStamp2], 'year')).toEqual([1970, 1970]);
        });
        describe('should return the range in YearMonthDate', function () {
            expect(filter_1.getDefaultRange([timeStamp1, timeStamp2], 'yearmonthdate')).toEqual([
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
});
