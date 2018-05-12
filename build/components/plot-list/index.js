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
var CSSModules = require("react-css-modules");
var react_redux_1 = require("react-redux");
var react_spinners_1 = require("react-spinners");
var result_1 = require("../../actions/result");
var constants_1 = require("../../constants");
var index_1 = require("../../selectors/index");
var shelf_1 = require("../../selectors/shelf");
var plot_1 = require("../plot");
var styles = require("./plot-list.scss");
var PlotListBase = (function (_super) {
    __extends(PlotListBase, _super);
    function PlotListBase(props) {
        var _this = _super.call(this, props) || this;
        _this.onLoadMore = _this.onLoadMore.bind(_this);
        return _this;
    }
    PlotListBase.prototype.render = function () {
        var _this = this;
        var _a = this.props, handleAction = _a.handleAction, bookmark = _a.bookmark, data = _a.data, filters = _a.filters, result = _a.result;
        var plots = result.plots, limit = result.limit, isLoading = result.isLoading;
        var plotListItems = plots && plots.slice(0, limit).map(function (plot, index) {
            var spec = plot.spec, fieldInfos = plot.fieldInfos;
            return (React.createElement(plot_1.Plot, { data: data, key: index, fieldInfos: fieldInfos, filters: filters, handleAction: handleAction, isPlotListItem: true, onSort: _this.onPlotSort.bind(_this, index), showBookmarkButton: true, showSpecifyButton: true, spec: spec, bookmark: bookmark }));
        });
        return (React.createElement("div", null,
            React.createElement("div", { styleName: "plot-list" }, isLoading ?
                React.createElement("div", { styleName: 'plot-list-loading' },
                    React.createElement(react_spinners_1.ClipLoader, { color: constants_1.SPINNER_COLOR })) :
                plotListItems),
            plots && plots.length > limit && (React.createElement("a", { styleName: "load-more", onClick: this.onLoadMore }, "Load more..."))));
    };
    PlotListBase.prototype.onPlotSort = function (index, channel, value) {
        var _a = this.props, handleAction = _a.handleAction, resultType = _a.resultType;
        var action = {
            type: result_1.RESULT_MODIFY_FIELD_PROP,
            payload: {
                resultType: resultType,
                index: index,
                channel: channel,
                prop: 'sort',
                value: value
            }
        };
        handleAction(action);
    };
    PlotListBase.prototype.onLoadMore = function () {
        var _a = this.props, handleAction = _a.handleAction, resultType = _a.resultType;
        handleAction({
            type: result_1.RESULT_LIMIT_INCREASE,
            payload: {
                resultType: resultType,
                increment: 4
            }
        });
    };
    return PlotListBase;
}(React.PureComponent));
exports.PlotListBase = PlotListBase;
exports.PlotList = react_redux_1.connect(function (state /*, props*/) {
    // TODO: once we have multiple cached data from Leilani's engine
    // take spec from props and read spec.data.name
    return {
        data: index_1.selectFilteredData(state),
        filters: shelf_1.selectFilters(state)
    };
})(CSSModules(PlotListBase, styles));
//# sourceMappingURL=index.js.map