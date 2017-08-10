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
var channel_1 = require("vega-lite/build/src/channel");
var mark_1 = require("vega-lite/build/src/mark");
var dataset_1 = require("../models/dataset");
var index_1 = require("../models/index");
var plot_1 = require("../models/plot");
var result_1 = require("../models/result");
var index_2 = require("../models/shelf/index");
var spec_1 = require("../models/shelf/spec");
var result_2 = require("./result");
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
    url: 'a/data/set.csv'
};
var filters = [{ field: 'q1', range: [0, 1] }];
var mark = 'point';
var encodingWildcard = {
    x: { field: '?', type: expandedtype_1.ExpandedType.QUANTITATIVE }
};
var encodingSpecific = {
    y: { field: 'q1', type: expandedtype_1.ExpandedType.TEMPORAL }
};
var group = buildSpecQueryModelGroup([
    {
        mark: mark_1.Mark.BAR,
        encodings: [
            { channel: channel_1.Channel.X }
        ]
    }
]);
var modelGroup = plot_1.convertToPlotObjectsGroup(group, data);
var stateSpecific = {
    persistent: index_1.DEFAULT_PERSISTENT_STATE,
    undoable: __assign({}, index_1.DEFAULT_STATE.undoable, { present: __assign({}, index_1.DEFAULT_STATE.undoable.present, { dataset: __assign({}, dataset_1.DEFAULT_DATASET, { data: data }), shelf: __assign({}, index_2.DEFAULT_SHELF, { spec: {
                    filters: filters,
                    mark: mark,
                    encoding: encodingSpecific,
                    anyEncodings: [],
                    config: { numberFormat: 'd' }
                } }), result: __assign({}, result_1.DEFAULT_RESULT_INDEX, { main: __assign({}, result_1.DEFAULT_RESULT, { modelGroup: modelGroup }) }) }) })
};
var stateWildcard = {
    persistent: index_1.DEFAULT_PERSISTENT_STATE,
    undoable: __assign({}, index_1.DEFAULT_STATE.undoable, { present: __assign({}, stateSpecific.undoable.present, { shelf: __assign({}, stateSpecific.undoable.present.shelf, { spec: __assign({}, stateSpecific.undoable.present.shelf.spec, { encoding: encodingWildcard }) }) }) })
};
describe('selectors/result', function () {
    describe('selectMainSpec', function () {
        it('should return undefined', function () {
            expect(result_2.selectMainSpec(index_1.DEFAULT_STATE)).toBe(undefined);
        });
        it('should return a main spec', function () {
            expect(result_2.selectMainSpec(stateSpecific)).toEqual(__assign({ data: data, transform: spec_1.getTransforms(filters) }, model_1.getTopSpecQueryItem(modelGroup).spec));
        });
    });
    describe('selectMainPlotList', function () {
        it('should return undefined', function () {
            expect(result_2.selectPlotList.main(index_1.DEFAULT_STATE)).toBe(undefined);
        });
        it('should return a main plot list', function () {
            expect(result_2.selectPlotList.main(stateWildcard)).toEqual(plot_1.extractPlotObjects(modelGroup, filters));
        });
    });
});
