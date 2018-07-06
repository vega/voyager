"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var wildcard_1 = require("compassql/build/src/wildcard");
var vegaExpression = require("vega-expression");
var predicate_1 = require("vega-lite/build/src/predicate");
var timeunit_1 = require("vega-lite/build/src/timeunit");
var transform_1 = require("vega-lite/build/src/transform");
function fromTransforms(transforms) {
    if (!transforms) {
        return [];
    }
    else {
        return transforms.map(function (transform) {
            if (!transform_1.isFilter(transform)) {
                throw new Error('Voyager does not support transforms other than FilterTransform');
            }
            else if (!predicate_1.isFieldRangePredicate(transform.filter) && !predicate_1.isFieldOneOfPredicate(transform.filter)) {
                throw new Error('Voyager does not support filters other than RangeFilter and OneOfFilter');
            }
            return transform.filter;
        });
    }
}
exports.fromTransforms = fromTransforms;
function toTransforms(filters) {
    return filters.map(function (filter) { return ({ filter: filter }); });
}
exports.toTransforms = toTransforms;
/**
 * Return a dataflow expression function for a given array of filter.
 * Following example code from https://github.com/uwdata/dataflow-api/blob/master/test/filter-test.js
 */
function toPredicateFunction(filters) {
    var expr = '(' +
        filters.map(function (f) {
            return predicate_1.fieldFilterExpression(f, false); // Do not use inrange as it is not included in the main Vega Expression
        }).join(')&&(') +
        ')';
    var ast = vegaExpression.parse(expr);
    var codegen = vegaExpression.codegen({
        whitelist: ['datum'],
        globalvar: 'global'
    });
    var value = codegen(ast);
    return new Function('datum', "return " + value.code + ";");
}
exports.toPredicateFunction = toPredicateFunction;
function createDefaultFilter(fieldDef, domain) {
    var field = fieldDef.field, type = fieldDef.type, fn = fieldDef.fn;
    if (wildcard_1.isWildcard(field)) {
        return;
    }
    switch (type) {
        case expandedtype_1.ExpandedType.QUANTITATIVE:
            return { field: field, range: domain };
        case expandedtype_1.ExpandedType.TEMPORAL:
            // TODO: consider if we want to change default time unit?
            var timeUnit = !wildcard_1.isWildcard(fn) && timeunit_1.isTimeUnit(fn) ? fn : 'year';
            return {
                timeUnit: timeUnit,
                field: field,
                range: getDefaultTimeRange(domain, timeUnit)
            };
        case expandedtype_1.ExpandedType.NOMINAL:
        case expandedtype_1.ExpandedType.ORDINAL:
        case expandedtype_1.ExpandedType.KEY:
            return { field: field, oneOf: domain };
        default:
            throw new Error('Unsupported type ' + fieldDef.type);
    }
}
exports.createDefaultFilter = createDefaultFilter;
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
function getDefaultTimeRange(domain, timeUnit) {
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
        case undefined:
            return [convertToDateTimeObject(Number(domain[0])), convertToDateTimeObject(Number(domain[1]))];
    }
    throw new Error('Cannot determine range for unsupported time unit ' + timeUnit);
}
exports.getDefaultTimeRange = getDefaultTimeRange;
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
function filterIndexOf(filters, field) {
    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        if (filter.field === field) {
            return i;
        }
    }
    return -1;
}
exports.filterIndexOf = filterIndexOf;
function filterHasField(filters, field) {
    return filterIndexOf(filters, field) >= 0;
}
exports.filterHasField = filterHasField;
//# sourceMappingURL=filter.js.map