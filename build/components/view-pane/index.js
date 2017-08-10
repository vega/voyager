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
var redux_action_1 = require("../../actions/redux-action");
var selectors_1 = require("../../selectors");
var shelf_1 = require("../../selectors/shelf");
var plot_1 = require("../plot");
var plot_list_1 = require("../plot-list");
var related_views_1 = require("./related-views");
var styles = require("./view-pane.scss");
var NO_PLOT_MESSAGE = "No specified visualization yet. " +
    "Start exploring by dragging a field to encoding pane " +
    "on the left or examining univariate summaries below.";
var ViewPaneBase = (function (_super) {
    __extends(ViewPaneBase, _super);
    function ViewPaneBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ViewPaneBase.prototype.render = function () {
        var _a = this.props, bookmark = _a.bookmark, isQuerySpecific = _a.isQuerySpecific, handleAction = _a.handleAction, plots = _a.plots;
        if (isQuerySpecific) {
            return (React.createElement("div", { styleName: "view-pane" },
                React.createElement("div", { className: "pane", styleName: "view-pane-specific" },
                    React.createElement("h2", null, "Specified View"),
                    this.renderSpecifiedView()),
                React.createElement("div", { className: "pane", styleName: "view-pane-related-views" },
                    React.createElement("h2", null, "Related Views"),
                    React.createElement(related_views_1.RelatedViews, null))));
        }
        else if (plots) {
            return (React.createElement("div", { className: "pane", styleName: "view-pane-gallery" },
                React.createElement("h2", null, "Specified Views"),
                React.createElement(plot_list_1.PlotList, { handleAction: handleAction, plots: plots, bookmark: bookmark })));
        }
        else {
            // if there are no results, then nothing to render.
            return null;
        }
    };
    ViewPaneBase.prototype.renderSpecifiedView = function () {
        var _a = this.props, bookmark = _a.bookmark, handleAction = _a.handleAction, spec = _a.spec;
        if (spec) {
            return (React.createElement(plot_1.Plot, { handleAction: handleAction, spec: spec, showBookmarkButton: true, bookmark: bookmark }));
        }
        else {
            return (React.createElement("span", null, NO_PLOT_MESSAGE));
        }
    };
    return ViewPaneBase;
}(React.PureComponent));
exports.ViewPane = react_redux_1.connect(function (state) {
    return {
        isQuerySpecific: shelf_1.selectIsQuerySpecific(state),
        plots: selectors_1.selectPlotList.main(state),
        spec: selectors_1.selectMainSpec(state),
        bookmark: selectors_1.selectBookmark(state)
    };
}, redux_action_1.createDispatchHandler())(CSSModules(ViewPaneBase, styles));
