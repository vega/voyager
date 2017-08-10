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
var shelf_1 = require("./shelf");
var spec_1 = require("./shelf/spec");
function extractPlotObjects(modelGroup, filters) {
    return modelGroup.items.map(function (item) {
        if (model_1.isSpecQueryGroup(item)) {
            var childModelGroup = item;
            var topSpecQueryItem = model_1.getTopSpecQueryItem(childModelGroup);
            return __assign({}, topSpecQueryItem, { spec: addFiltersInSpec(topSpecQueryItem.spec, filters) });
        }
        return __assign({}, item, { spec: addFiltersInSpec(item.spec, filters) });
    });
}
exports.extractPlotObjects = extractPlotObjects;
function convertToPlotObjectsGroup(modelGroup, data) {
    var items = modelGroup.items.map(function (item) {
        if (model_1.isSpecQueryGroup(item)) {
            var childModelGroup = item;
            return plotObject(data, model_1.getTopSpecQueryItem(childModelGroup));
        }
        // FIXME: include data in the main spec?
        return plotObject(data, item);
    });
    return {
        name: modelGroup.name,
        path: modelGroup.path,
        items: items,
        groupBy: modelGroup.groupBy,
        orderGroupBy: modelGroup.orderGroupBy,
    };
}
exports.convertToPlotObjectsGroup = convertToPlotObjectsGroup;
// FIXME: include data in the main query?
function plotObject(data, specQ) {
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
    return { fieldInfos: fieldInfos, spec: spec };
}
function addFiltersInSpec(spec, filters) {
    return __assign({}, spec, { transform: spec_1.getTransforms(filters) });
}
