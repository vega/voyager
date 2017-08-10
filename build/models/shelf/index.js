"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var encoding_1 = require("./encoding");
var spec_1 = require("./spec");
__export(require("./encoding"));
__export(require("./spec"));
exports.DEFAULT_SHELF = {
    spec: spec_1.DEFAULT_SHELF_UNIT_SPEC
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
    spec.encodings.push(encoding_1.toFieldQuery(fieldDef, '?'));
    return {
        spec: spec,
        chooseBy: 'effectiveness'
        // TODO: customizable config
    };
}
exports.autoAddFieldQuery = autoAddFieldQuery;
