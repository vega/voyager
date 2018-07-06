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
var shelf_preview_1 = require("../../actions/shelf-preview");
var index_1 = require("../../actions/shelf/index");
var result_1 = require("../../models/result");
var index_2 = require("../../queries/index");
var index_3 = require("../../selectors/index");
var result_2 = require("../../selectors/result");
var index_4 = require("../plot-list/index");
var styles = require("./related-views.scss");
var RelatedViewsBase = (function (_super) {
    __extends(RelatedViewsBase, _super);
    function RelatedViewsBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RelatedViewsBase.prototype.render = function () {
        var _this = this;
        var _a = this.props, bookmark = _a.bookmark, handleAction = _a.handleAction, results = _a.results;
        var subpanes = index_2.RELATED_VIEWS_TYPES.map(function (relatedViewType) {
            var title = index_2.RELATED_VIEWS_INDEX[relatedViewType].title;
            var result = results[relatedViewType];
            var isLoading = result.isLoading, plots = result.plots;
            return ((isLoading || plots && plots.length > 0) && React.createElement("div", { styleName: "related-views-subpane", key: relatedViewType },
                React.createElement("div", null,
                    React.createElement("h3", null, title),
                    relatedViewType !== 'histograms' &&
                        React.createElement("i", { title: 'Specify', styleName: 'command', className: "fa fa-server", onClick: _this.onSpecify.bind(_this, relatedViewType), onMouseEnter: _this.onPreviewMouseEnter.bind(_this, relatedViewType), onMouseLeave: _this.onPreviewMouseLeave.bind(_this, relatedViewType) })),
                React.createElement(index_4.PlotList, { handleAction: handleAction, bookmark: bookmark, resultType: relatedViewType, result: result })));
        });
        return (React.createElement("div", null, subpanes));
    };
    RelatedViewsBase.prototype.onSpecify = function (relatedViewType) {
        var _a = this.props, handleAction = _a.handleAction, results = _a.results;
        var query = results[relatedViewType].query;
        handleAction({
            type: index_1.SHELF_LOAD_QUERY,
            payload: { query: query }
        });
    };
    RelatedViewsBase.prototype.onPreviewMouseEnter = function (relatedViewType) {
        var _a = this.props, handleAction = _a.handleAction, results = _a.results;
        var query = results[relatedViewType].query;
        handleAction({
            type: shelf_preview_1.SHELF_PREVIEW_QUERY,
            payload: { query: query }
        });
    };
    RelatedViewsBase.prototype.onPreviewMouseLeave = function (relatedViewType) {
        var handleAction = this.props.handleAction;
        handleAction({ type: shelf_preview_1.SHELF_PREVIEW_DISABLE });
    };
    return RelatedViewsBase;
}(React.PureComponent));
exports.RelatedViewsBase = RelatedViewsBase;
exports.RelatedViews = react_redux_1.connect(function (state) {
    return {
        results: result_1.RESULT_TYPES.reduce(function (results, resultType) {
            results[resultType] = result_2.selectResult[resultType](state);
            return results;
        }, {}),
        bookmark: index_3.selectBookmark(state)
    };
}, redux_action_1.createDispatchHandler())(CSSModules(RelatedViewsBase, styles));
//# sourceMappingURL=related-views.js.map