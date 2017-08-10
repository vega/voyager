"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var channel_1 = require("vega-lite/build/src/channel");
var mark_1 = require("vega-lite/build/src/mark");
var model_1 = require("compassql/build/src/model");
var schema_1 = require("compassql/build/src/schema");
var plot_1 = require("./plot");
var config_1 = require("compassql/build/src/config");
describe('models/plot', function () {
    var schema = new schema_1.Schema({ fields: [] });
    function buildSpecQueryModel(specQ) {
        return model_1.SpecQueryModel.build(specQ, schema, config_1.DEFAULT_QUERY_CONFIG);
    }
    function buildSpecQueryModelGroup(specQs) {
        var items = specQs.map(function (specQ) { return buildSpecQueryModel(specQ); });
        return {
            name: 'a name',
            path: 'path',
            items: items,
        };
    }
    describe('convertToPlotObjectsGroup', function () {
        it('converts SpecQueryGroup<SpecQueryModel> to SpecQueryGroup<PlotObject>', function () {
            var group = buildSpecQueryModelGroup([
                {
                    mark: mark_1.Mark.BAR,
                    encodings: [
                        { channel: channel_1.Channel.X }
                    ]
                }
            ]);
            var data = { url: 'a/data/set.csv' };
            var plotObjectGroup = plot_1.convertToPlotObjectsGroup(group, data);
            // should have a spec
            expect(model_1.getTopSpecQueryItem(plotObjectGroup).spec).toEqual({
                data: { url: 'a/data/set.csv' },
                mark: 'bar',
                encoding: { x: {} },
                config: {
                    overlay: { line: true },
                    scale: { useUnaggregatedDomain: true }
                }
            });
        });
    });
    describe('extractPlotObjects', function () {
        it('extracts plot objects from SpecQueryGroup<PlotObject>', function () {
            var group = buildSpecQueryModelGroup([
                {
                    mark: mark_1.Mark.BAR,
                    encodings: [
                        { channel: channel_1.Channel.X }
                    ]
                }
            ]);
            var data = { url: 'a/data/set.csv' };
            var plotObjectGroup = plot_1.convertToPlotObjectsGroup(group, data);
            var filter = { field: 'q1', range: [0, 1] };
            var plotObjects = plot_1.extractPlotObjects(plotObjectGroup, [filter]);
            expect(plotObjects.length).toEqual(1);
            expect(plotObjects[0].spec).toEqual({
                data: { url: 'a/data/set.csv' },
                mark: 'bar',
                encoding: { x: {} },
                transform: [
                    { filter: filter }
                ],
                config: {
                    overlay: { line: true },
                    scale: { useUnaggregatedDomain: true }
                }
            });
        });
    });
});
