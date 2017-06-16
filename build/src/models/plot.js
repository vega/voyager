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
function extractPlotObjects(modelGroup) {
    return modelGroup.items.map(function (item) {
        if (model_1.isSpecQueryGroup(item)) {
            var childModelGroup = item;
            return childModelGroup.getTopSpecQueryItem();
        }
        return item;
    });
}
exports.extractPlotObjects = extractPlotObjects;
function convertToPlotObjectsGroup(modelGroup, data) {
    var items = modelGroup.items.map(function (item) {
        if (model_1.isSpecQueryGroup(item)) {
            var childModelGroup = item;
            return plotObject(data, childModelGroup.getTopSpecQueryItem());
        }
        // FIXME: include data in the main spec?
        return plotObject(data, item);
    });
    return new model_1.SpecQueryGroup(modelGroup.name, modelGroup.path, items, modelGroup.groupBy, modelGroup.orderGroupBy);
}
exports.convertToPlotObjectsGroup = convertToPlotObjectsGroup;
// FIXME: include data in the main query?
function plotObject(data, specQ) {
    var wildcardFieldIndex = util_1.toMap(specQ.wildcardIndex.encodingIndicesByProperty.get('field') || []);
    var fieldInfos = specQ.getEncodings()
        .filter(encoding_1.isFieldQuery)
        .map(function (fieldQ, index) {
        var aggregate = fieldQ.aggregate, field = fieldQ.field, timeUnit = fieldQ.timeUnit, hasFn = fieldQ.hasFn, bin = fieldQ.bin, type = fieldQ.type;
        // HACK not all properties are compatible
        return {
            fieldDef: { aggregate: aggregate, field: field, timeUnit: timeUnit, hasFn: hasFn, bin: bin, type: type },
            isEnumeratedWildcardField: index in wildcardFieldIndex
        };
    });
    var spec = __assign({ data: data }, specQ.toSpec());
    return { fieldInfos: fieldInfos, spec: spec };
}
