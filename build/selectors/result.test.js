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
var config_1 = require("compassql/build/src/config");
var model_1 = require("compassql/build/src/model");
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var schema_1 = require("compassql/build/src/schema");
var custom_wildcard_field_1 = require("../models/custom-wildcard-field");
var dataset_1 = require("../models/dataset");
var index_1 = require("../models/index");
var result_1 = require("../models/result");
var result_2 = require("../models/result");
var index_2 = require("../models/shelf/index");
var index_3 = require("../models/shelf/spec/index");
var result_3 = require("./result");
function buildSpecQueryModel(specQ) {
    return model_1.SpecQueryModel.build(specQ, new schema_1.Schema({ fields: [] }), config_1.DEFAULT_QUERY_CONFIG);
}
function buildSpecQueryModelGroup(specQs) {
    var items = specQs.map(function (specQ) { return buildSpecQueryModel(specQ); });
    return {
        name: 'a name',
        path: 'path',
        items: items,
    };
}
var data = {
    values: [{ a: 1 }]
};
var spec = {
    mark: 'point',
    encoding: {
        y: { field: 'q1', type: expandedtype_1.ExpandedType.TEMPORAL }
    },
    anyEncodings: [],
    config: { numberFormat: 'd' }
};
var group = buildSpecQueryModelGroup([index_3.toSpecQuery(spec)]);
var plots = result_1.fromSpecQueryModelGroup(group, { name: 'source' }).map(function (p) { return p.plot; });
var stateSpecific = {
    persistent: index_1.DEFAULT_PERSISTENT_STATE,
    undoable: __assign({}, index_1.DEFAULT_STATE.undoable, { present: __assign({}, index_1.DEFAULT_STATE.undoable.present, { dataset: __assign({}, dataset_1.DEFAULT_DATASET, { data: data }), customWildcardFields: custom_wildcard_field_1.DEFAULT_CUSTOM_WILDCARD_FIELDS, tab: {
                activeTabID: index_1.DEFAULT_ACTIVE_TAB_ID,
                list: [__assign({}, index_1.DEFAULT_PLOT_TAB_STATE, { shelf: __assign({}, index_2.DEFAULT_SHELF, { spec: spec }), result: __assign({}, result_2.DEFAULT_RESULT_INDEX, { main: __assign({}, result_2.DEFAULT_RESULT, { plots: plots }) }) })]
            } }) })
};
describe('selectors/result', function () {
    describe('selectMainSpec', function () {
        it('should return undefined', function () {
            expect(result_3.selectMainSpec(index_1.DEFAULT_STATE)).toBe(undefined);
        });
        it('should return a main spec', function () {
            expect(result_3.selectMainSpec(stateSpecific)).toEqual(plots[0].spec);
        });
    });
});
//# sourceMappingURL=result.test.js.map