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
var React = require("react");
var CSSModules = require("react-css-modules");
var plot_1 = require("../plot");
var styles = require("./plot-list.scss");
var PlotListBase = (function (_super) {
    __extends(PlotListBase, _super);
    function PlotListBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PlotListBase.prototype.render = function () {
        var _a = this.props, plots = _a.plots, handleAction = _a.handleAction;
        var plotListItems = plots.map(function (plot) {
            var spec = plot.spec, fieldInfos = plot.fieldInfos;
            return (React.createElement(plot_1.Plot, { key: JSON.stringify(spec), fieldInfos: fieldInfos, handleAction: handleAction, isPlotListItem: true, scrollOnHover: true, showSpecifyButton: true, spec: spec }));
        });
        return (React.createElement("div", { styleName: "plot-list" }, plotListItems));
    };
    return PlotListBase;
}(React.PureComponent));
exports.PlotList = CSSModules(PlotListBase, styles);
