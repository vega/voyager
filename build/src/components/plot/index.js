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
var styles = require("./plot.scss");
var shelf_1 = require("../../actions/shelf");
var constants_1 = require("../../constants");
var index_1 = require("../field/index");
var index_2 = require("../vega-lite/index");
var PlotBase = (function (_super) {
    __extends(PlotBase, _super);
    function PlotBase(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { hovered: false, preview: false };
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onMouseEnter = _this.onMouseEnter.bind(_this);
        _this.onMouseLeave = _this.onMouseLeave.bind(_this);
        _this.onPreviewMouseEnter = _this.onPreviewMouseEnter.bind(_this);
        _this.onPreviewMouseLeave = _this.onPreviewMouseLeave.bind(_this);
        _this.onSpecify = _this.onSpecify.bind(_this);
        return _this;
    }
    PlotBase.prototype.render = function () {
        var _a = this.props, isPlotListItem = _a.isPlotListItem, scrollOnHover = _a.scrollOnHover, showSpecifyButton = _a.showSpecifyButton, spec = _a.spec;
        return (React.createElement("div", { styleName: isPlotListItem ? 'plot-list-item-group' : 'plot-group' },
            React.createElement("div", { styleName: "plot-info" },
                React.createElement("div", { styleName: "plot-command" }, showSpecifyButton && this.specifyButton()),
                React.createElement("span", { onMouseEnter: this.onPreviewMouseEnter, onMouseLeave: this.onPreviewMouseLeave }, this.fields())),
            React.createElement("div", { styleName: scrollOnHover && this.state.hovered ? 'plot-scroll' : 'plot', className: "persist-scroll", onMouseEnter: this.onMouseEnter, onMouseLeave: this.onMouseLeave },
                React.createElement(index_2.VegaLite, { spec: spec }))));
    };
    PlotBase.prototype.componentWillUnmount = function () {
        this.clearHoverTimeout();
    };
    PlotBase.prototype.fields = function () {
        var fieldInfos = this.props.fieldInfos;
        if (fieldInfos) {
            return fieldInfos.map(function (fieldInfo) {
                var fieldDef = fieldInfo.fieldDef, isEnumeratedWildcardField = fieldInfo.isEnumeratedWildcardField;
                return (React.createElement("div", { styleName: "plot-field-info", key: JSON.stringify(fieldDef) },
                    React.createElement(index_1.Field, { fieldDef: fieldDef, draggable: false, isEnumeratedWildcardField: isEnumeratedWildcardField, isPill: false })));
            });
        }
        return undefined;
    };
    PlotBase.prototype.clearHoverTimeout = function () {
        if (this.hoverTimeoutId) {
            clearTimeout(this.hoverTimeoutId);
            this.hoverTimeoutId = undefined;
        }
    };
    PlotBase.prototype.clearPreviewTimeout = function () {
        if (this.previewTimeoutId) {
            clearTimeout(this.previewTimeoutId);
            this.previewTimeoutId = undefined;
        }
    };
    PlotBase.prototype.onMouseEnter = function () {
        var _this = this;
        this.hoverTimeoutId = setTimeout(function () {
            // TODO log action
            _this.setState({ hovered: true });
            _this.hoverTimeoutId = undefined;
        }, constants_1.PLOT_HOVER_MIN_DURATION);
    };
    PlotBase.prototype.onMouseLeave = function () {
        this.clearHoverTimeout();
        if (this.state.hovered) {
            this.setState({ hovered: false });
        }
    };
    PlotBase.prototype.onSpecify = function () {
        var _a = this.props, handleAction = _a.handleAction, spec = _a.spec;
        handleAction({
            type: shelf_1.SHELF_SPEC_LOAD,
            payload: { spec: spec }
        });
    };
    PlotBase.prototype.onPreviewMouseEnter = function () {
        var _this = this;
        this.previewTimeoutId = setTimeout(function () {
            var _a = _this.props, handleAction = _a.handleAction, spec = _a.spec;
            _this.setState({ preview: true });
            handleAction({
                type: shelf_1.SHELF_SPEC_PREVIEW,
                payload: { spec: spec }
            });
            _this.previewTimeoutId = undefined;
        }, constants_1.PLOT_HOVER_MIN_DURATION);
    };
    PlotBase.prototype.onPreviewMouseLeave = function () {
        this.clearPreviewTimeout();
        if (this.state.preview) {
            this.setState({ preview: false });
            var handleAction = this.props.handleAction;
            handleAction({ type: shelf_1.SHELF_SPEC_PREVIEW_DISABLE });
        }
    };
    PlotBase.prototype.specifyButton = function () {
        return React.createElement("i", { className: "fa fa-server", styleName: "specify-button", onClick: this.onSpecify, onMouseEnter: this.onPreviewMouseEnter, onMouseLeave: this.onPreviewMouseLeave });
    };
    return PlotBase;
}(React.PureComponent));
exports.Plot = CSSModules(PlotBase, styles);
