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
var wildcard_1 = require("compassql/build/src/wildcard");
var encoding_1 = require("compassql/build/src/query/encoding");
var aggregate_1 = require("vega-lite/build/src/aggregate");
var timeunit_1 = require("vega-lite/build/src/timeunit");
var util_1 = require("../../util");
;
;
function isWildcardChannelId(shelfId) {
    return wildcard_1.isWildcard(shelfId.channel);
}
exports.isWildcardChannelId = isWildcardChannelId;
function fromEncodingQueries(encodings) {
    return encodings.reduce(function (encodingMixins, encQ) {
        if (wildcard_1.isWildcard(encQ.channel)) {
            encodingMixins.anyEncodings.push(__assign({ channel: encQ.channel }, fromEncodingQuery(encQ)));
        }
        else {
            encodingMixins.encoding[encQ.channel] = fromEncodingQuery(encQ);
        }
        return encodingMixins;
    }, { encoding: {}, anyEncodings: [] });
}
exports.fromEncodingQueries = fromEncodingQueries;
function fromEncodingQuery(encQ) {
    if (encoding_1.isFieldQuery(encQ)) {
        return fromFieldQuery(encQ);
    }
    else if (encoding_1.isAutoCountQuery(encQ)) {
        throw Error('AutoCount Query not yet supported');
    }
    else {
        throw Error('Value Query not yet supported');
    }
}
exports.fromEncodingQuery = fromEncodingQuery;
function toEncodingQuery(fieldDef, channel) {
    return toFieldQuery(fieldDef, channel);
}
exports.toEncodingQuery = toEncodingQuery;
var AGGREGATE_INDEX = util_1.toSet(aggregate_1.AGGREGATE_OPS);
var TIMEUNIT_INDEX = util_1.toSet(timeunit_1.TIMEUNITS);
function isAggregate(fn) {
    return AGGREGATE_INDEX[fn];
}
function isTimeUnit(fn) {
    return TIMEUNIT_INDEX[fn];
}
function getFunctionMixins(fn) {
    if (isAggregate(fn)) {
        return { aggregate: fn };
    }
    else if (fn === 'bin') {
        return { bin: true };
    }
    else if (isTimeUnit(fn)) {
        return { timeUnit: fn };
    }
    return {};
}
function toFieldQuery(fieldDef, channel) {
    var field = fieldDef.field, fn = fieldDef.fn, type = fieldDef.type, _t = fieldDef.title;
    if (wildcard_1.isWildcard(fn)) {
        throw Error('fn cannot be a wildcard (yet)');
    }
    return __assign({ channel: channel, field: field, type: type }, getFunctionMixins(fn));
}
exports.toFieldQuery = toFieldQuery;
function fromFieldQuery(fieldQ) {
    var aggregate = fieldQ.aggregate, bin = fieldQ.bin, timeUnit = fieldQ.timeUnit, field = fieldQ.field, type = fieldQ.type;
    if (wildcard_1.isWildcard(type)) {
        throw Error('Voyager does not support wildcard type');
    }
    var fn;
    if (bin) {
        if (util_1.isObject(bin)) {
            console.warn('Voyager does not yet support loading VLspec with bin');
        }
        fn = 'bin';
    }
    else if (aggregate) {
        if (wildcard_1.isWildcard(aggregate)) {
            throw Error('Voyager does not support aggregate wildcard (yet)');
        }
        else {
            fn = aggregate;
        }
    }
    else if (timeUnit) {
        if (wildcard_1.isWildcard(timeUnit)) {
            throw Error('Voyager does not support wildcard timeUnit (yet)');
        }
        else {
            fn = timeUnit;
        }
    }
    return { field: field, type: type, fn: fn };
}
exports.fromFieldQuery = fromFieldQuery;
