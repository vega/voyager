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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("compassql/build/src/model");
var React = require("react");
var CSSModules = require("react-css-modules");
var react_redux_1 = require("react-redux");
var redux_action_1 = require("../../actions/redux-action");
var plot_1 = require("../../models/plot");
var spec_1 = require("../../models/shelf/spec");
var selectors_1 = require("../../selectors");
var plot_2 = require("../plot");
var plot_list_1 = require("../plot-list");
var styles = require("./view-pane.scss");
var ViewPaneBase = (function (_super) {
    __extends(ViewPaneBase, _super);
    function ViewPaneBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ViewPaneBase.prototype.render = function () {
        var _a = this.props, bookmark = _a.bookmark, data = _a.data, handleAction = _a.handleAction, filters = _a.filters, query = _a.query, mainResult = _a.mainResult;
        var isSpecific = !spec_1.hasWildcards(query.spec).hasAnyWildcard;
        // if there are no results, then nothing to render.
        if (!mainResult) {
            return null;
        }
        if (isSpecific) {
            var spec = __assign({ 
                // FIXME: include data in the main spec?
                data: data, transform: spec_1.getTransforms(filters) }, model_1.getTopSpecQueryItem(mainResult).spec);
            return (React.createElement("div", { className: "pane", styleName: "view-pane-specific" },
                React.createElement("h2", null, "Specified View"),
                React.createElement(plot_2.Plot, { handleAction: handleAction, spec: spec, showBookmarkButton: true, bookmark: bookmark })));
        }
        else {
            var plots = plot_1.extractPlotObjects(mainResult);
            return (React.createElement("div", { className: "pane", styleName: "view-pane-gallery" },
                React.createElement("h2", null, "Specified Views"),
                React.createElement(plot_list_1.PlotList, { handleAction: handleAction, plots: plots, bookmark: bookmark })));
        }
    };
    return ViewPaneBase;
}(React.PureComponent));
exports.ViewPane = react_redux_1.connect(function (state) {
    return {
        data: selectors_1.getData(state),
        query: selectors_1.getQuery(state),
        filters: selectors_1.getFilters(state),
        // FIXME: refactor the flow for this part (we should support asynchrounous request for this too)
        mainResult: selectors_1.getMainResult(state),
        bookmark: selectors_1.getBookmark(state)
    };
}, redux_action_1.createDispatchHandler())(CSSModules(ViewPaneBase, styles));
