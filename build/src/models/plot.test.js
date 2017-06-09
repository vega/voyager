"use strict";
var channel_1 = require("vega-lite/build/src/channel");
var mark_1 = require("vega-lite/build/src/mark");
var model_1 = require("compassql/build/src/model");
var schema_1 = require("compassql/build/src/schema");
var plot_1 = require("./plot");
var config_1 = require("compassql/build/src/config");
describe('models/plot', function () {
    var schema = new schema_1.Schema([]);
    function buildSpecQueryModel(specQ) {
        return model_1.SpecQueryModel.build(specQ, schema, config_1.DEFAULT_QUERY_CONFIG);
    }
    function buildSpecQueryModelGroup(specQs) {
        var items = specQs.map(function (specQ) { return buildSpecQueryModel(specQ); });
        return new model_1.SpecQueryGroup('a name', 'path', items);
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
            expect(plotObjectGroup.getTopSpecQueryItem().spec).toEqual({
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
            var plotObjects = plot_1.extractPlotObjects(plotObjectGroup);
            expect(plotObjects.length).toEqual(1);
            expect(plotObjects[0].spec).toEqual({
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
});
