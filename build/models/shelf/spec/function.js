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
var config_1 = require("compassql/build/src/config");
var wildcard_1 = require("compassql/build/src/wildcard");
var aggregate_1 = require("vega-lite/build/src/aggregate");
var timeunit_1 = require("vega-lite/build/src/timeunit");
var util_1 = require("vega-lite/build/src/util");
var QUANTITATIVE_FUNCTIONS = [
    undefined, 'bin',
    'min', 'max',
    'mean', 'median',
    'sum'
];
var TEMPORAL_FUNCTIONS = [
    undefined,
    'yearmonthdate',
    'year', 'month',
    'date', 'day',
    'hours', 'minutes',
    'seconds', 'milliseconds'
];
var FUNCTIONS_INDEX = __assign({}, QUANTITATIVE_FUNCTIONS.reduce(function (index, fn, i) {
    index[fn] = i;
    return index;
}, {}), TEMPORAL_FUNCTIONS.reduce(function (index, fn, i) {
    index[fn] = i;
    return index;
}, {}));
function getSupportedFunction(type) {
    switch (type) {
        case 'quantitative':
            return QUANTITATIVE_FUNCTIONS;
        case 'temporal':
            return TEMPORAL_FUNCTIONS;
    }
    return [];
}
exports.getSupportedFunction = getSupportedFunction;
function isShelfFunction(fn) {
    return fn === 'bin' ||
        fn === undefined || fn === null ||
        aggregate_1.isAggregateOp(fn) || timeunit_1.isTimeUnit(fn);
}
exports.isShelfFunction = isShelfFunction;
function toFieldQueryFunctionMixins(fn) {
    if (wildcard_1.isWildcard(fn)) {
        var fns = sortFunctions(fn.enum); // sort a new copy of the array
        var aggregates = [];
        var timeUnits = [];
        var hasBin = false;
        var hasNoFn = false;
        for (var _i = 0, fns_1 = fns; _i < fns_1.length; _i++) {
            var f = fns_1[_i];
            if (aggregate_1.isAggregateOp(f)) {
                aggregates.push(f);
            }
            else if (timeunit_1.isTimeUnit(f)) {
                timeUnits.push(f);
            }
            else if (f === 'bin') {
                hasBin = true;
            }
            else if (f === undefined || f === null) {
                // Check for null just in case things get copied
                hasNoFn = true;
            }
            else {
                throw new Error('Invalid function ' + f);
            }
        }
        var functionTypeCount = (aggregates.length > 0 ? 1 : 0) +
            (timeUnits.length > 0 ? 1 : 0) +
            (hasBin ? 1 : 0);
        var enumerateUndefined = functionTypeCount > 1 || hasNoFn;
        var baseEnum = enumerateUndefined ? [undefined] : [];
        var hasFn = !hasNoFn;
        var mixins = __assign({}, (aggregates.length > 0 ? {
            aggregate: { enum: [].concat(baseEnum, aggregates) }
        } : {}), (timeUnits.length > 0 ? {
            timeUnit: { enum: [].concat(baseEnum, timeUnits) }
        } : {}), (hasBin ? {
            bin: {
                enum: (enumerateUndefined ? [false] : []).concat([true])
                // TODO: deal with bin params
            }
        } : {}), (hasFn ? { hasFn: hasFn } : {}));
        if (!mixins.aggregate && !mixins.timeUnit && !mixins.bin) {
            // For enum: [undefined], return this special mixins
            return {
                bin: {
                    enum: [false]
                },
                timeUnit: {
                    enum: [undefined]
                },
                aggregate: {
                    enum: [undefined]
                }
            };
        }
        return mixins;
    }
    else if (aggregate_1.isAggregateOp(fn)) {
        return { aggregate: fn };
    }
    else if (fn === 'bin') {
        return { bin: true };
    }
    else if (timeunit_1.isTimeUnit(fn)) {
        return { timeUnit: fn };
    }
    return {};
}
exports.toFieldQueryFunctionMixins = toFieldQueryFunctionMixins;
function excludeUndefined(fn) {
    if (!isShelfFunction) {
        console.warn("Invalid function " + fn + " dropped");
        return false;
    }
    return fn !== undefined && fn !== null;
}
function fromFieldQueryFunctionMixins(fieldQParts) {
    // FIXME make this a parameter
    var config = config_1.DEFAULT_QUERY_CONFIG;
    var aggregate = fieldQParts.aggregate, bin = fieldQParts.bin, hasFn = fieldQParts.hasFn, timeUnit = fieldQParts.timeUnit;
    var fns = [];
    var fn;
    var hasUndefinedInEnum = false;
    if (bin) {
        if (wildcard_1.isWildcard(bin)) {
            var bins = wildcard_1.isShortWildcard(bin) ? [true, false] : bin.enum;
            fns = fns.concat(util_1.contains(bins, true) ? ['bin'] : []);
            hasUndefinedInEnum = hasUndefinedInEnum || util_1.contains(bins, false);
        }
        else if (bin) {
            fn = 'bin';
        }
    }
    if (aggregate) {
        if (wildcard_1.isWildcard(aggregate)) {
            var aggregates = wildcard_1.isShortWildcard(aggregate) ? config.enum.aggregate : aggregate.enum;
            fns = fns.concat(
            // We already filter composite aggregate function so it is fine to cast here
            // as the only thing left would be AggregateOp (but TS would not know that)
            aggregates.filter(excludeUndefined));
            hasUndefinedInEnum = hasUndefinedInEnum || util_1.contains(aggregates, undefined);
        }
        else if (!fn) {
            fn = aggregate;
        }
        else {
            throw Error("Invalid field with function " + fn + " and " + aggregate);
        }
    }
    if (timeUnit) {
        if (wildcard_1.isWildcard(timeUnit)) {
            var timeUnits = wildcard_1.isShortWildcard(timeUnit) ? config.enum.timeUnit : timeUnit.enum;
            fns = fns.concat(timeUnits.filter(excludeUndefined));
            hasUndefinedInEnum = hasUndefinedInEnum || util_1.contains(timeUnits, undefined);
        }
        else if (!fn) {
            fn = timeUnit;
        }
        else {
            throw Error("Invalid field with function " + fn + " and " + timeUnit);
        }
    }
    if (fn) {
        return fn;
    }
    if (hasUndefinedInEnum && !hasFn) {
        // prepend undefined
        fns.unshift(undefined);
    }
    if (fns.length > 0) {
        return { enum: sortFunctions(fns) };
    }
    return undefined;
}
exports.fromFieldQueryFunctionMixins = fromFieldQueryFunctionMixins;
function sortFunctions(fns) {
    // Javascript array.sort() always put undefined value at the end.
    // So we have to convert them to null first and convert them back after sorting.
    // Convert undefined so they don't get pushed to the end
    return fns.map(function (f) { return f || null; })
        .sort(function (a, b) {
        if (a == null) {
            a = undefined;
        }
        if (b == null) {
            b = undefined;
        }
        return FUNCTIONS_INDEX[a] - FUNCTIONS_INDEX[b];
    })
        .map(function (f) { return f || undefined; });
}
exports.sortFunctions = sortFunctions;
//# sourceMappingURL=function.js.map