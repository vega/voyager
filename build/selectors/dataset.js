"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("compassql/build/src/wildcard");
var reselect_1 = require("reselect");
exports.selectData = function (state) { return state.undoable.present.dataset.data; };
exports.selectDataset = function (state) { return state.undoable.present.dataset; };
exports.selectSchema = function (state) { return state.undoable.present.dataset.schema; };
var ALL_PRESET_WILDCARD_FIELDS = [
    { field: wildcard_1.SHORT_WILDCARD, type: 'quantitative', description: 'Quantitative Fields' },
    { field: wildcard_1.SHORT_WILDCARD, type: 'nominal', description: 'Categorical Fields' },
    { field: wildcard_1.SHORT_WILDCARD, type: 'temporal', description: 'Temporal Fields' },
];
exports.selectPresetWildcardFields = reselect_1.createSelector(exports.selectSchema, function (schema) {
    if (!schema) {
        return [];
    }
    var typeIndex = schema.fieldSchemas.reduce(function (index, fieldSchema) {
        index[fieldSchema.vlType] = true;
        return index;
    }, {});
    return ALL_PRESET_WILDCARD_FIELDS.filter(function (fieldDef) { return typeIndex[fieldDef.type]; });
});
exports.selectSchemaFieldDefs = reselect_1.createSelector(exports.selectSchema, function (schema) {
    if (!schema) {
        return [];
    }
    return schema.fieldSchemas.map(function (fieldSchema) {
        var name = fieldSchema.name, vlType = fieldSchema.vlType;
        return { field: name, type: vlType };
    });
});
//# sourceMappingURL=dataset.js.map