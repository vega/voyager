"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var vega = require("vega");
var vl = require("vega-lite");
var vegaTooltip = require("vega-tooltip");
var CHART_REF = 'chart';
var VegaLite = (function (_super) {
    __extends(VegaLite, _super);
    function VegaLite() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VegaLite.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("div", { className: 'chart', ref: CHART_REF }),
            React.createElement("div", { id: "vis-tooltip", className: "vg-tooltip" })));
    };
    VegaLite.prototype.renderVega = function (vlSpec) {
        var spec = vl.compile(vlSpec).spec;
        var runtime = vega.parse(spec, vlSpec.config);
        var view = new vega.View(runtime)
            .logLevel(vega.Warn)
            .initialize(this.refs[CHART_REF])
            .renderer(this.props.renderer || 'svg')
            .hover()
            .run();
        vegaTooltip.vega(view);
    };
    VegaLite.prototype.componentDidMount = function () {
        this.renderVega(this.props.spec);
    };
    VegaLite.prototype.componentWillReceiveProps = function (nextProps) {
        var _this = this;
        if (this.props.spec !== nextProps.spec) {
            setTimeout(function () {
                _this.renderVega(nextProps.spec);
            });
        }
        // visual.update(nextProps.vegaSpec);
    };
    return VegaLite;
}(React.PureComponent));
exports.VegaLite = VegaLite;
