"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("compassql/build/src/wildcard");
var reselect_1 = require("reselect");
var models_1 = require("../models");
exports.getData = function (state) { return state.present.dataset.data; };
exports.getShelf = function (state) { return state.present.shelf; };
exports.getSchema = function (state) { return state.present.dataset.schema; };
exports.getMainResult = function (state) { return state.present.result.main.modelGroup; };
exports.getConfig = function (state) { return state.present.config; };
exports.getQuery = reselect_1.createSelector(exports.getShelf, function (shelf) {
    return models_1.toQuery(shelf);
});
var ALL_PRESET_WILDCARD_FIELDS = [
    { field: wildcard_1.SHORT_WILDCARD, type: 'quantitative', title: 'Quantitative Fields' },
    { field: wildcard_1.SHORT_WILDCARD, type: 'nominal', title: 'Categorical Fields' },
    { field: wildcard_1.SHORT_WILDCARD, type: 'temporal', title: 'Temporal Fields' },
];
exports.getPresetWildcardFields = reselect_1.createSelector(exports.getSchema, function (schema) {
    var typeIndex = schema.fieldSchemas.reduce(function (index, fieldSchema) {
        index[fieldSchema.vlType] = true;
        return index;
    }, {});
    return ALL_PRESET_WILDCARD_FIELDS.filter(function (fieldDef) { return typeIndex[fieldDef.type]; });
});
exports.getSchemaFieldDefs = reselect_1.createSelector(exports.getSchema, function (schema) {
    return schema.fieldSchemas.map(function (fieldSchema) {
        var name = fieldSchema.name, vlType = fieldSchema.vlType;
        return { field: name, type: vlType };
    });
});
