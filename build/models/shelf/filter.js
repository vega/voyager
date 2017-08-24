"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var wildcard_1 = require("compassql/build/src/wildcard");
var timeunit_1 = require("vega-lite/build/src/timeunit");
function getFilter(fieldDef, domain) {
    if (wildcard_1.isWildcard(fieldDef.field)) {
        return;
    }
    switch (fieldDef.type) {
        case expandedtype_1.ExpandedType.QUANTITATIVE:
            return { field: fieldDef.field, range: domain };
        case expandedtype_1.ExpandedType.TEMPORAL:
            return {
                field: fieldDef.field,
                range: [convertToDateTimeObject(domain[0]), convertToDateTimeObject(domain[1])]
            };
        case expandedtype_1.ExpandedType.NOMINAL:
        case expandedtype_1.ExpandedType.ORDINAL:
        case expandedtype_1.ExpandedType.KEY:
            return { field: fieldDef.field, oneOf: domain };
        default:
            throw new Error('Unsupported type ' + fieldDef.type);
    }
}
exports.getFilter = getFilter;
function getAllTimeUnits() {
    return [
        timeunit_1.TimeUnit.YEARMONTHDATE,
        timeunit_1.TimeUnit.YEAR,
        timeunit_1.TimeUnit.MONTH,
        timeunit_1.TimeUnit.QUARTER,
        timeunit_1.TimeUnit.DATE,
        timeunit_1.TimeUnit.DAY,
        timeunit_1.TimeUnit.HOURS,
        timeunit_1.TimeUnit.MINUTES,
        timeunit_1.TimeUnit.SECONDS,
        timeunit_1.TimeUnit.MILLISECONDS
    ];
}
exports.getAllTimeUnits = getAllTimeUnits;
function getDefaultRange(domain, timeUnit) {
    switch (timeUnit) {
        case timeunit_1.TimeUnit.YEARMONTHDATE:
            return [convertToDateTimeObject(Number(timeunit_1.convert(timeUnit, new Date(domain[0])))),
                convertToDateTimeObject(Number(timeunit_1.convert(timeUnit, new Date(domain[1]))))];
        case timeunit_1.TimeUnit.YEAR:
            return [timeunit_1.convert(timeUnit, new Date(domain[0])).getFullYear(),
                timeunit_1.convert(timeUnit, new Date(domain[1])).getFullYear()];
        case timeunit_1.TimeUnit.QUARTER:
            return [1, 4];
        case timeunit_1.TimeUnit.DATE:
            return [1, 31];
        case timeunit_1.TimeUnit.HOURS:
            return [0, 23];
        case timeunit_1.TimeUnit.MINUTES:
            return [0, 59];
        case timeunit_1.TimeUnit.SECONDS:
            return [0, 59];
        case timeunit_1.TimeUnit.MILLISECONDS:
            return [0, 999];
        default:
            throw new Error('Invalid range time unit ' + timeUnit);
    }
}
exports.getDefaultRange = getDefaultRange;
function getDefaultList(timeUnit) {
    switch (timeUnit) {
        case timeunit_1.TimeUnit.MONTH:
            return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];
        case timeunit_1.TimeUnit.DAY:
            return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        default:
            throw new Error('Invalid time unit ' + timeUnit);
    }
}
exports.getDefaultList = getDefaultList;
function convertToDateTimeObject(timeStamp) {
    var date = new Date(timeStamp);
    return {
        year: date.getFullYear(),
        quarter: Math.floor((date.getMonth() + 3) / 3),
        month: date.getMonth() + 1,
        date: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        milliseconds: date.getMilliseconds(),
        utc: date.getTimezoneOffset() === 0
    };
}
exports.convertToDateTimeObject = convertToDateTimeObject;
function convertToTimestamp(dateTime) {
    var date = new Date(dateTime.year, Number(dateTime.month) - 1, // 0-indexing
    dateTime.date, dateTime.hours, dateTime.minutes, dateTime.seconds, dateTime.milliseconds);
    return Number(date);
}
exports.convertToTimestamp = convertToTimestamp;
function containsFilter(filters, target) {
    for (var _i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
        var filter = filters_1[_i];
        if (filter.field === target.field) {
            return true;
        }
    }
    return false;
}
exports.containsFilter = containsFilter;
//# sourceMappingURL=filter.js.map