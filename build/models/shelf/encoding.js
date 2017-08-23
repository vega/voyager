"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var encoding_1 = require("compassql/build/src/query/encoding");
var wildcard_1 = require("compassql/build/src/wildcard");
var function_1 = require("./function");
__export(require("./function"));
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
function toFieldQuery(fieldDef, channel) {
    var field = fieldDef.field, fn = fieldDef.fn, type = fieldDef.type, _t = fieldDef.title;
    return __assign({ channel: channel, field: field, type: type }, function_1.toFieldQueryFunctionMixins(fn));
}
exports.toFieldQuery = toFieldQuery;
function fromFieldQuery(fieldQ) {
    var aggregate = fieldQ.aggregate, bin = fieldQ.bin, hasFn = fieldQ.hasFn, timeUnit = fieldQ.timeUnit, field = fieldQ.field, type = fieldQ.type;
    if (wildcard_1.isWildcard(type)) {
        throw Error('Voyager does not support wildcard type');
    }
    var fn = function_1.fromFieldQueryFunctionMixins({ aggregate: aggregate, bin: bin, timeUnit: timeUnit, hasFn: hasFn });
    return __assign({}, (fn ? { fn: fn } : {}), { field: field,
        type: type });
}
exports.fromFieldQuery = fromFieldQuery;
//# sourceMappingURL=encoding.js.map