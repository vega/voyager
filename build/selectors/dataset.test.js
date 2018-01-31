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
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var schema_1 = require("compassql/build/src/schema");
var dataset_1 = require("../models/dataset");
var index_1 = require("../models/index");
var dataset_2 = require("./dataset");
var stateWithSchema = __assign({}, index_1.DEFAULT_STATE);
stateWithSchema.undoable.present.dataset.schema = new schema_1.Schema({
    fields: [
        {
            name: 'q1',
            vlType: expandedtype_1.ExpandedType.QUANTITATIVE,
            type: schema_1.PrimitiveType.NUMBER,
            stats: {
                distinct: 2
            }
        }, {
            name: 'q2',
            vlType: expandedtype_1.ExpandedType.QUANTITATIVE,
            type: schema_1.PrimitiveType.NUMBER,
            stats: {
                distinct: 2
            }
        }
    ]
});
describe('selectors/dataset', function () {
    describe('selectData', function () {
        it('selecting data should returns default data', function () {
            expect(dataset_2.selectData(index_1.DEFAULT_STATE)).toBe(dataset_1.DEFAULT_DATASET.data);
        });
    });
    describe('selectDataset', function () {
        it('selecting dataset should return default dataset', function () {
            expect(dataset_2.selectDataset(index_1.DEFAULT_STATE)).toBe(dataset_1.DEFAULT_DATASET);
        });
    });
    describe('selectSchema', function () {
        it('selecting schema should return the default schema', function () {
            expect(dataset_2.selectSchema(index_1.DEFAULT_STATE)).toBe(index_1.DEFAULT_STATE.undoable.present.dataset.schema);
        });
    });
    describe('selectPresetWildcardFields', function () {
        it('should return wildcard fields', function () {
            expect(dataset_2.selectPresetWildcardFields(stateWithSchema)).toEqual([
                { field: '?', description: 'Quantitative Fields', type: expandedtype_1.ExpandedType.QUANTITATIVE }
            ]);
        });
    });
    describe('selectSchemaFieldDefs', function () {
        it('should return field defs constructed from the given schema', function () {
            expect(dataset_2.selectSchemaFieldDefs(stateWithSchema)).toEqual([
                { field: 'q1', type: expandedtype_1.ExpandedType.QUANTITATIVE },
                { field: 'q2', type: expandedtype_1.ExpandedType.QUANTITATIVE }
            ]);
        });
    });
});
//# sourceMappingURL=dataset.test.js.map