"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("compassql/build/src/wildcard");
var reselect_1 = require("reselect");
var models_1 = require("../models");
exports.selectBookmark = function (state) { return state.present.bookmark; };
exports.selectConfig = function (state) { return state.present.config; };
exports.selectData = function (state) { return state.present.dataset.data; };
exports.selectFilters = function (state) { return state.present.shelf.spec.filters; };
exports.selectShelf = function (state) { return state.present.shelf; };
exports.selectSchema = function (state) { return state.present.dataset.schema; };
exports.selectMainResult = function (state) { return state.present.result.main.modelGroup; };
exports.selectQuery = reselect_1.createSelector(exports.selectShelf, function (shelf) {
    return models_1.toQuery(shelf);
});
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
