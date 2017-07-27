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
var wildcard_1 = require("compassql/build/src/wildcard");
var reselect_1 = require("reselect");
var models_1 = require("../models");
var plot_1 = require("../models/plot");
var spec_1 = require("../models/shelf/spec");
// tslint:enable:no-unused-variable
exports.selectBookmark = function (state) { return state.present.bookmark; };
exports.selectConfig = function (state) { return state.present.config; };
exports.selectData = function (state) { return state.present.dataset.data; };
exports.selectFilters = function (state) { return state.present.shelf.spec.filters; };
exports.selectShelf = function (state) { return state.present.shelf; };
exports.selectSchema = function (state) { return state.present.dataset.schema; };
exports.selectQuery = reselect_1.createSelector(exports.selectShelf, function (shelf) {
    return models_1.toQuery(shelf);
});
exports.selectQuerySpec = reselect_1.createSelector(exports.selectQuery, function (query) { return query.spec; });
var ALL_PRESET_WILDCARD_FIELDS = [
    { field: wildcard_1.SHORT_WILDCARD, type: 'quantitative', title: 'Quantitative Fields' },
    { field: wildcard_1.SHORT_WILDCARD, type: 'nominal', title: 'Categorical Fields' },
    { field: wildcard_1.SHORT_WILDCARD, type: 'temporal', title: 'Temporal Fields' },
];
exports.selectPresetWildcardFields = reselect_1.createSelector(exports.selectSchema, function (schema) {
    var typeIndex = schema.fieldSchemas.reduce(function (index, fieldSchema) {
        index[fieldSchema.vlType] = true;
        return index;
    }, {});
    return ALL_PRESET_WILDCARD_FIELDS.filter(function (fieldDef) { return typeIndex[fieldDef.type]; });
});
exports.selectSchemaFieldDefs = reselect_1.createSelector(exports.selectSchema, function (schema) {
    return schema.fieldSchemas.map(function (fieldSchema) {
        var name = fieldSchema.name, vlType = fieldSchema.vlType;
        return { field: name, type: vlType };
    });
});
var selectMainResult = function (state) { return state.present.result && state.present.result.main; };
var selectIsQuerySpecific = reselect_1.createSelector(exports.selectQuerySpec, function (spec) {
    return !spec_1.hasWildcards(spec).hasAnyWildcard;
});
exports.selectMainSpec = reselect_1.createSelector(selectIsQuerySpecific, exports.selectData, exports.selectFilters, selectMainResult, function (isQuerySpecific, data, filters, mainResult) {
    if (!isQuerySpecific || !mainResult || !mainResult.modelGroup) {
        return undefined;
    }
    return __assign({ data: data, transform: spec_1.getTransforms(filters) }, model_1.getTopSpecQueryItem(mainResult.modelGroup).spec);
});
exports.selectMainPlotList = reselect_1.createSelector(selectIsQuerySpecific, exports.selectData, exports.selectFilters, selectMainResult, function (isQuerySpecific, data, filters, mainResult) {
    if (isQuerySpecific || !mainResult || !mainResult.modelGroup) {
        return undefined;
    }
    // FIXME(https://github.com/vega/voyager/issues/448): use data and filter
    return plot_1.extractPlotObjects(mainResult.modelGroup);
});
