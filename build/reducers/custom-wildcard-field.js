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
var util_1 = require("compassql/build/src/util");
var custom_wildcard_field_1 = require("../actions/custom-wildcard-field");
var util_2 = require("./util");
function modifyFieldsProperty(fields) {
    return function (customWildcardField) {
        return __assign({}, customWildcardField, { fields: fields });
    };
}
function customWildcardFieldReducer(customWildcardFields, action) {
    if (customWildcardFields === void 0) { customWildcardFields = []; }
    switch (action.type) {
        case custom_wildcard_field_1.CUSTOM_WILDCARD_ADD: {
            var _a = action.payload, fields = _a.fields, type = _a.type;
            var index = action.payload.index;
            if (!index) {
                index = customWildcardFields.length;
            }
            return util_2.insertItemToArray(customWildcardFields, index, {
                fields: fields,
                type: type,
                description: null
            });
        }
        case custom_wildcard_field_1.CUSTOM_WILDCARD_REMOVE: {
            var index = action.payload.index;
            return util_2.removeItemFromArray(customWildcardFields, index).array;
        }
        case custom_wildcard_field_1.CUSTOM_WILDCARD_ADD_FIELD: {
            var _b = action.payload, index = _b.index, fields = _b.fields;
            var originalFields = customWildcardFields[index].fields;
            var originalFieldsIndex_1 = util_1.toMap(originalFields);
            var addedFields = fields.filter(function (field) { return !originalFieldsIndex_1[field]; });
            if (addedFields.length > 0) {
                return util_2.modifyItemInArray(customWildcardFields, index, modifyFieldsProperty(originalFields.concat(addedFields)));
            }
            return customWildcardFields;
        }
        case custom_wildcard_field_1.CUSTOM_WILDCARD_REMOVE_FIELD: {
            var _c = action.payload, index = _c.index, field_1 = _c.field;
            var originalFields = customWildcardFields[index].fields;
            var updatedFields = originalFields.filter(function (originalField) { return originalField !== field_1; });
            return util_2.modifyItemInArray(customWildcardFields, index, modifyFieldsProperty(updatedFields));
        }
        case custom_wildcard_field_1.CUSTOM_WILDCARD_MODIFY_DESCRIPTION: {
            var _d = action.payload, index = _d.index, description_1 = _d.description;
            var modifyTitle = function (customWildcardField) {
                return __assign({}, customWildcardField, { description: description_1 });
            };
            return util_2.modifyItemInArray(customWildcardFields, index, modifyTitle);
        }
    }
    return customWildcardFields;
}
exports.customWildcardFieldReducer = customWildcardFieldReducer;
//# sourceMappingURL=custom-wildcard-field.js.map