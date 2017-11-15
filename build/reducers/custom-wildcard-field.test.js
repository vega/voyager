"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var custom_wildcard_field_1 = require("../actions/custom-wildcard-field");
var custom_wildcard_field_2 = require("./custom-wildcard-field");
describe('reducers/custom-wildcard-field', function () {
    describe(custom_wildcard_field_1.CUSTOM_WILDCARD_ADD, function () {
        it('should return a custom wildcard field array containing one custom wildcard field', function () {
            var noCustomWildcardFields = [];
            var customWildcardFields = custom_wildcard_field_2.customWildcardFieldReducer(noCustomWildcardFields, {
                type: custom_wildcard_field_1.CUSTOM_WILDCARD_ADD,
                payload: {
                    fields: ['acceleration', 'horsepower'],
                    type: expandedtype_1.ExpandedType.QUANTITATIVE
                }
            });
            expect(customWildcardFields).toEqual([
                {
                    fields: ['acceleration', 'horsepower'],
                    type: expandedtype_1.ExpandedType.QUANTITATIVE,
                    description: null
                }
            ]);
        });
    });
    var customWildcardFields = [
        {
            fields: ['acceleration', 'horsepower'],
            type: expandedtype_1.ExpandedType.QUANTITATIVE,
            description: null
        }
    ];
    describe(custom_wildcard_field_1.CUSTOM_WILDCARD_REMOVE, function () {
        it('should return remove the specified custom wildcard field from the array', function () {
            var customWildcardFieldsAfterRemove = custom_wildcard_field_2.customWildcardFieldReducer(customWildcardFields, {
                type: custom_wildcard_field_1.CUSTOM_WILDCARD_REMOVE,
                payload: {
                    index: 0
                }
            });
            expect(customWildcardFieldsAfterRemove).toEqual([]);
        });
    });
    describe(custom_wildcard_field_1.CUSTOM_WILDCARD_ADD_FIELD, function () {
        it('should correctly modify the fields property of a custom wildcard field when a ' +
            'preset wildcard field is dragged on top of a custom wildcard field', function () {
            var customWildcardFieldsAfterAddField = custom_wildcard_field_2.customWildcardFieldReducer(customWildcardFields, {
                type: custom_wildcard_field_1.CUSTOM_WILDCARD_ADD_FIELD,
                payload: {
                    index: 0,
                    fields: ['acceleration', 'displacement', 'horsepower', 'miles per gallon']
                }
            });
            expect(customWildcardFieldsAfterAddField).toEqual([
                {
                    fields: ['acceleration', 'horsepower', 'displacement', 'miles per gallon'],
                    type: expandedtype_1.ExpandedType.QUANTITATIVE,
                    description: null
                }
            ]);
        });
        it('should correctly modify the fields property of a custom wildcard field when a ' +
            'single field is dragged on top of a custom wildcard field', function () {
            var customWildcardFieldsAfterAddField = custom_wildcard_field_2.customWildcardFieldReducer(customWildcardFields, {
                type: custom_wildcard_field_1.CUSTOM_WILDCARD_ADD_FIELD,
                payload: {
                    index: 0,
                    fields: ['displacement']
                }
            });
            expect(customWildcardFieldsAfterAddField).toEqual([
                {
                    fields: ['acceleration', 'horsepower', 'displacement'],
                    type: expandedtype_1.ExpandedType.QUANTITATIVE,
                    description: null
                }
            ]);
        });
    });
    describe(custom_wildcard_field_1.CUSTOM_WILDCARD_REMOVE_FIELD, function () {
        it('should remove the field from a custom wildcard field', function () {
            var customWildcardFieldsAfterRemoveField = custom_wildcard_field_2.customWildcardFieldReducer(customWildcardFields, {
                type: custom_wildcard_field_1.CUSTOM_WILDCARD_REMOVE_FIELD,
                payload: {
                    index: 0,
                    field: 'acceleration'
                }
            });
            expect(customWildcardFieldsAfterRemoveField).toEqual([
                {
                    fields: ['horsepower'],
                    type: expandedtype_1.ExpandedType.QUANTITATIVE,
                    description: null
                }
            ]);
        });
    });
    describe(custom_wildcard_field_1.CUSTOM_WILDCARD_MODIFY_DESCRIPTION, function () {
        it('should modify the title of a custom wildcard field', function () {
            var customWildcardFieldsAfterTitleUpdate = custom_wildcard_field_2.customWildcardFieldReducer(customWildcardFields, {
                type: custom_wildcard_field_1.CUSTOM_WILDCARD_MODIFY_DESCRIPTION,
                payload: {
                    index: 0,
                    description: 'Custom Q Wildcard'
                }
            });
            expect(customWildcardFieldsAfterTitleUpdate).toEqual([
                {
                    fields: ['acceleration', 'horsepower'],
                    type: expandedtype_1.ExpandedType.QUANTITATIVE,
                    description: 'Custom Q Wildcard'
                }
            ]);
        });
    });
});
//# sourceMappingURL=custom-wildcard-field.test.js.map