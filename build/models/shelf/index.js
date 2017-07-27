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
var wildcard_1 = require("compassql/build/src/wildcard");
var spec_1 = require("./spec");
__export(require("./encoding"));
__export(require("./spec"));
exports.DEFAULT_SHELF_SPEC = {
    spec: spec_1.DEFAULT_SHELF_UNIT_SPEC,
    specPreview: null
};
exports.DEFAULT_ORDER_BY = ['fieldOrder', 'aggregationQuality', 'effectiveness'];
exports.DEFAULT_CHOOSE_BY = ['aggregationQuality', 'effectiveness'];
function toQuery(shelf) {
    var spec = spec_1.toSpecQuery(shelf.spec);
    var _a = spec_1.hasWildcards(spec), hasWildcardField = _a.hasWildcardField, hasWildcardFn = _a.hasWildcardFn, hasWildcardChannel = _a.hasWildcardChannel;
    // TODO: support custom groupBy
    var groupBy = hasWildcardFn ? 'fieldTransform' :
        hasWildcardField ? 'field' :
            'encoding';
    return {
        spec: spec,
        groupBy: groupBy,
        orderBy: exports.DEFAULT_ORDER_BY,
        chooseBy: exports.DEFAULT_CHOOSE_BY,
        config: {
            // TODO: support customAutoAddCount
            autoAddCount: (hasWildcardField || hasWildcardFn || hasWildcardChannel)
        }
    };
}
exports.toQuery = toQuery;
function autoAddFieldQuery(shelf, fieldDef) {
    var spec = spec_1.toSpecQuery(shelf);
    spec.encodings.push(__assign({ channel: wildcard_1.SHORT_WILDCARD }, fieldDef));
    return {
        spec: spec,
        chooseBy: 'effectiveness'
        // TODO: customizable config
    };
}
exports.autoAddFieldQuery = autoAddFieldQuery;
