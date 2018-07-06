"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var channel_1 = require("vega-lite/build/src/channel");
var mark_1 = require("vega-lite/build/src/mark");
var model_1 = require("compassql/build/src/model");
var schema_1 = require("compassql/build/src/schema");
var plot_1 = require("./plot");
var config_1 = require("compassql/build/src/config");
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var QUANTITATIVE = expandedtype_1.ExpandedType.QUANTITATIVE;
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
    describe('convertToPlotListWithKey', function () {
        it('converts SpecQueryGroup to ResultPlotWithKey[]', function () {
            var group = buildSpecQueryModelGroup([
                {
                    mark: mark_1.Mark.BAR,
                    encodings: [
                        { channel: channel_1.Channel.X }
                    ]
                }
            ]);
            var plotWithKey = plot_1.fromSpecQueryModelGroup(group, { name: 'a' });
            // should have a spec
            expect(plotWithKey[0].plot.spec).toEqual({
                data: { name: 'a' },
                mark: 'bar',
                encoding: { x: { aggregate: 'count', field: '*', type: QUANTITATIVE } },
                config: {
                    line: { point: true },
                    scale: { useUnaggregatedDomain: true }
                }
            });
        });
    });
});
//# sourceMappingURL=plot.test.js.map