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
var vega_util_1 = require("vega-util");
var spec_1 = require("./spec");
var spec_2 = require("./spec");
__export(require("./spec"));
__export(require("./filter"));
exports.DEFAULT_SHELF = {
    spec: spec_2.DEFAULT_SHELF_UNIT_SPEC,
    filters: [],
    groupBy: 'auto',
    autoAddCount: true
};
var SHELF_GROUP_BY_INDEX = {
    auto: 1,
    field: 1,
    fieldTransform: 1,
    encoding: 1
};
exports.SHELF_GROUP_BYS = Object.keys(SHELF_GROUP_BY_INDEX);
function isShelfGroupBy(s) {
    return vega_util_1.isString(s) && SHELF_GROUP_BY_INDEX[s];
}
exports.isShelfGroupBy = isShelfGroupBy;
exports.DEFAULT_ORDER_BY = ['fieldOrder', 'aggregationQuality', 'effectiveness'];
exports.DEFAULT_CHOOSE_BY = ['aggregationQuality', 'effectiveness'];
function toQuery(params) {
    var spec = params.spec, autoAddCount = params.autoAddCount;
    var specQ = spec_2.toSpecQuery(spec);
    var _a = spec_2.hasWildcards(specQ), hasAnyWildcard = _a.hasAnyWildcard, hasWildcardFn = _a.hasWildcardFn, hasWildcardField = _a.hasWildcardField;
    var groupBy = params.groupBy !== 'auto' ? params.groupBy :
        getDefaultGroupBy({ hasWildcardFn: hasWildcardFn, hasWildcardField: hasWildcardField });
    return __assign({ spec: specQ, groupBy: groupBy, orderBy: exports.DEFAULT_ORDER_BY, chooseBy: exports.DEFAULT_CHOOSE_BY }, (hasAnyWildcard ? { config: { autoAddCount: autoAddCount } } : {}));
}
exports.toQuery = toQuery;
function getDefaultGroupBy(args) {
    var hasWildcardFn = args.hasWildcardFn, hasWildcardField = args.hasWildcardField;
    return hasWildcardFn ? 'fieldTransform' :
        hasWildcardField ? 'field' :
            'encoding';
}
exports.getDefaultGroupBy = getDefaultGroupBy;
function autoAddFieldQuery(shelf, fieldDef) {
    var spec = spec_2.toSpecQuery(shelf);
    spec.encodings.push(spec_1.toFieldQuery(fieldDef, '?'));
    return {
        spec: spec,
        chooseBy: 'effectiveness'
        // TODO: customizable config
    };
}
exports.autoAddFieldQuery = autoAddFieldQuery;
//# sourceMappingURL=index.js.map