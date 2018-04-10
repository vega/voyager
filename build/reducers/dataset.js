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
var actions_1 = require("../actions");
var models_1 = require("../models");
var schema_1 = require("compassql/build/src/schema");
function datasetReducer(dataset, action) {
    if (dataset === void 0) { dataset = models_1.DEFAULT_DATASET; }
    switch (action.type) {
        case actions_1.DATASET_REQUEST: {
            return __assign({}, dataset, { isLoading: true });
        }
        case actions_1.DATASET_RECEIVE: {
            var _a = action.payload, name_1 = _a.name, data = _a.data, schema_2 = _a.schema;
            return __assign({}, dataset, { isLoading: false, name: name_1,
                schema: schema_2,
                data: data });
        }
    }
    var schema = schemaReducer(dataset.schema, action);
    if (dataset.schema !== schema) {
        return __assign({}, dataset, { schema: schema });
    }
    else {
        return dataset;
    }
}
exports.datasetReducer = datasetReducer;
function schemaReducer(schema, action) {
    if (schema === void 0) { schema = models_1.DEFAULT_DATASET.schema; }
    switch (action.type) {
        case actions_1.DATASET_SCHEMA_CHANGE_FIELD_TYPE: {
            var _a = action.payload, field = _a.field, type = _a.type;
            return changeFieldType(schema, field, type);
        }
        case actions_1.DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN: {
            var _b = action.payload, field = _b.field, domain = _b.domain;
            return changeOrdinalDomain(schema, field, domain);
        }
    }
    return schema;
}
exports.schemaReducer = schemaReducer;
function updateSchema(schema, field, changedFieldSchema) {
    var originalTableSchema = schema.tableSchema();
    var updatedTableSchemaFields = originalTableSchema.fields.map(function (fieldSchema) {
        if (fieldSchema.name !== field) {
            return fieldSchema;
        }
        return changedFieldSchema;
    });
    return new schema_1.Schema(__assign({}, originalTableSchema, { fields: updatedTableSchemaFields }));
}
function changeFieldType(schema, field, type) {
    return updateSchema(schema, field, __assign({}, schema.fieldSchema(field), { vlType: type }));
}
exports.changeFieldType = changeFieldType;
function changeOrdinalDomain(schema, field, domain) {
    return updateSchema(schema, field, __assign({}, schema.fieldSchema(field), { ordinalDomain: domain }));
}
exports.changeOrdinalDomain = changeOrdinalDomain;
//# sourceMappingURL=dataset.js.map