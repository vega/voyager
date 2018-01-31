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
var model_1 = require("compassql/build/src/model");
var encoding_1 = require("compassql/build/src/query/encoding");
var util_1 = require("compassql/build/src/util");
var shelf_1 = require("../shelf");
function fromSpecQueryModelGroup(modelGroup, data) {
    return modelGroup.items.map(function (item) {
        if (model_1.isSpecQueryGroup(item)) {
            var childModelGroup = item;
            return plotWithKey(data, model_1.getTopSpecQueryItem(childModelGroup), modelGroup.groupBy);
        }
        return plotWithKey(data, item, modelGroup.groupBy);
    });
}
exports.fromSpecQueryModelGroup = fromSpecQueryModelGroup;
function plotWithKey(data, specQ, groupBy) {
    var wildcardFieldIndex = util_1.toMap(specQ.wildcardIndex.encodingIndicesByProperty.get('field') || []);
    var fieldInfos = specQ.getEncodings()
        .filter(encoding_1.isFieldQuery)
        .map(function (fieldQ, index) {
        return {
            fieldDef: shelf_1.fromFieldQuery(fieldQ),
            isEnumeratedWildcardField: index in wildcardFieldIndex
        };
    });
    var spec = __assign({ data: data }, specQ.toSpec());
    var groupByKey = specQ.toShorthand(groupBy);
    return { plot: { fieldInfos: fieldInfos, spec: spec }, groupByKey: groupByKey };
}
//# sourceMappingURL=plot.js.map