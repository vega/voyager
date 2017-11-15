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
var encoding_2 = require("./encoding");
__export(require("./encoding"));
__export(require("./function"));
function toSpecQuery(spec) {
    return {
        mark: spec.mark,
        encodings: specificEncodingsToEncodingQueries(spec.encoding).concat(spec.anyEncodings.map(function (fieldDef) { return encoding_2.toEncodingQuery(fieldDef, '?'); })),
        config: spec.config
    };
}
exports.toSpecQuery = toSpecQuery;
function fromSpecQuery(spec, oldConfig) {
    var mark = spec.mark, encodings = spec.encodings, config = spec.config, transform = spec.transform;
    if (wildcard_1.isWildcardDef(mark)) {
        throw new Error('Voyager 2 does not support custom wildcard mark yet');
    }
    if (transform && transform.length > 0) {
        throw new Error('fromSpecQuery should not contain transform');
    }
    return __assign({ mark: mark }, encoding_2.fromEncodingQueries(encodings), { config: config || oldConfig });
}
exports.fromSpecQuery = fromSpecQuery;
// FIXME: remove this method and rely on CompassQL's method.
function hasWildcards(spec) {
    var hasWildcardField = false, hasWildcardFn = false, hasWildcardChannel = false;
    for (var _i = 0, _a = spec.encodings; _i < _a.length; _i++) {
        var encQ = _a[_i];
        if (encoding_1.isValueQuery(encQ)) {
            continue;
        }
        else if (encoding_1.isAutoCountQuery(encQ)) {
            if (wildcard_1.isWildcard(encQ.autoCount)) {
                hasWildcardFn = true;
            }
        }
        else {
            if (wildcard_1.isWildcard(encQ.field)) {
                hasWildcardField = true;
            }
            if (wildcard_1.isWildcard(encQ.aggregate) ||
                wildcard_1.isWildcard(encQ.bin) ||
                wildcard_1.isWildcard(encQ.timeUnit)) {
                hasWildcardFn = true;
            }
            if (wildcard_1.isWildcard(encQ.channel)) {
                hasWildcardChannel = true;
            }
        }
    }
    return {
        hasAnyWildcard: hasWildcardChannel || hasWildcardField || hasWildcardFn,
        hasWildcardField: hasWildcardField,
        hasWildcardFn: hasWildcardFn,
        hasWildcardChannel: hasWildcardChannel
    };
}
exports.hasWildcards = hasWildcards;
function specificEncodingsToEncodingQueries(encoding) {
    // Assemble definition of encodings with specific channels first
    return Object.keys(encoding).map(function (channel) {
        return encoding_2.toFieldQuery(encoding[channel], channel);
    });
}
exports.DEFAULT_SHELF_UNIT_SPEC = {
    mark: wildcard_1.SHORT_WILDCARD,
    encoding: {},
    anyEncodings: [],
    config: {}
};
//# sourceMappingURL=index.js.map