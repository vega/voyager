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
var result_1 = require("../../models/result");
var index_1 = require("../../queries/index");
var index_2 = require("../../selectors/index");
var result_2 = require("../../selectors/result");
var index_3 = require("../plot-list/index");
var styles = require("./related-views.scss");
var RelatedViewsBase = (function (_super) {
    __extends(RelatedViewsBase, _super);
    function RelatedViewsBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RelatedViewsBase.prototype.render = function () {
        var _a = this.props, bookmark = _a.bookmark, handleAction = _a.handleAction, plots = _a.plots;
        var subpanes = index_1.RELATED_VIEWS_TYPES.map(function (relatedViewType) {
            var plotObjects = plots[relatedViewType];
            var title = index_1.RELATED_VIEWS_INDEX[relatedViewType].title;
            return (plotObjects && plotObjects.length > 0 &&
                React.createElement("div", { styleName: "related-views-subpane", key: relatedViewType },
                    React.createElement("h3", null, title),
                    React.createElement(index_3.PlotList, { handleAction: handleAction, plots: plotObjects, bookmark: bookmark })));
        });
        return (React.createElement("div", null, subpanes));
    };
    return RelatedViewsBase;
}(React.PureComponent));
exports.RelatedViewsBase = RelatedViewsBase;
exports.RelatedViews = react_redux_1.connect(function (state) {
    return {
        plots: result_1.RESULT_TYPES.reduce(function (plots, resultType) {
            plots[resultType] = result_2.selectPlotList[resultType](state);
            return plots;
        }, {}),
        bookmark: index_2.selectBookmark(state)
    };
}, redux_action_1.createDispatchHandler())(CSSModules(RelatedViewsBase, styles));
