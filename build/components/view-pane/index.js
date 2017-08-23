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
var index_1 = require("../../actions/shelf/index");
var spec_1 = require("../../actions/shelf/spec");
var index_2 = require("../../models/shelf/index");
var selectors_1 = require("../../selectors");
var result_1 = require("../../selectors/result");
var shelf_1 = require("../../selectors/shelf");
var plot_1 = require("../plot");
var plot_list_1 = require("../plot-list");
var related_views_1 = require("./related-views");
var styles = require("./view-pane.scss");
var NO_PLOT_MESSAGE = "No specified visualization yet. " +
    "Start exploring by dragging a field to encoding pane " +
    "on the left or examining univariate summaries below.";
var GROUP_BY_LABEL = {
    auto: 'Automatic',
    field: 'Field',
    fieldTransform: 'Field and Transformations',
    encoding: 'Visual Encodings'
};
var ViewPaneBase = (function (_super) {
    __extends(ViewPaneBase, _super);
    function ViewPaneBase(props) {
        var _this = _super.call(this, props) || this;
        _this.onSort = _this.onSort.bind(_this);
        _this.onAutoAddCountChange = _this.onAutoAddCountChange.bind(_this);
        _this.onGroupByChange = _this.onGroupByChange.bind(_this);
        return _this;
    }
    ViewPaneBase.prototype.render = function () {
        var _a = this.props, isQuerySpecific = _a.isQuerySpecific, plots = _a.plots;
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
            return this.renderSpecifiedViews();
        }
        else {
            // if there are no results, then nothing to render.
            return null;
        }
    };
    ViewPaneBase.prototype.onSort = function (channel, value) {
        var handleAction = this.props.handleAction;
        handleAction({
            type: spec_1.SPEC_FIELD_PROP_CHANGE,
            payload: {
                shelfId: { channel: channel },
                prop: 'sort',
                value: value
            }
        });
    };
    ViewPaneBase.prototype.renderSpecifiedView = function () {
        var _a = this.props, bookmark = _a.bookmark, handleAction = _a.handleAction, spec = _a.spec;
        if (spec) {
            return (React.createElement(plot_1.Plot, { bookmark: bookmark, handleAction: handleAction, onSort: this.onSort, showBookmarkButton: true, spec: spec }));
        }
        else {
            return (React.createElement("span", null, NO_PLOT_MESSAGE));
        }
    };
    ViewPaneBase.prototype.renderSpecifiedViews = function () {
        var _a = this.props, bookmark = _a.bookmark, handleAction = _a.handleAction, plots = _a.plots, mainLimit = _a.mainLimit, autoAddCount = _a.autoAddCount, groupBy = _a.groupBy, defaultGroupBy = _a.defaultGroupBy;
        var options = index_2.SHELF_GROUP_BYS.map(function (value) {
            var label = value === 'auto' ?
                GROUP_BY_LABEL[defaultGroupBy] + " (Automatic)" :
                GROUP_BY_LABEL[value];
            return (React.createElement("option", { value: value, key: value }, label));
        });
        return (React.createElement("div", { className: "pane", styleName: "view-pane-gallery" },
            React.createElement("div", { className: "right" },
                React.createElement("label", { styleName: "gallery-command" },
                    "Showing views with different",
                    ' ',
                    React.createElement("select", { value: groupBy, onChange: this.onGroupByChange }, options)),
                React.createElement("label", { styleName: "gallery-command" },
                    React.createElement("input", { type: "checkbox", checked: autoAddCount, onChange: this.onAutoAddCountChange }),
                    ' ',
                    "Auto Add Count")),
            React.createElement("h2", null, "Specified Views"),
            React.createElement(plot_list_1.PlotList, { resultType: "main", handleAction: handleAction, plots: plots, bookmark: bookmark, limit: mainLimit })));
    };
    ViewPaneBase.prototype.onAutoAddCountChange = function (event) {
        var autoAddCount = event.target.checked;
        var handleAction = this.props.handleAction;
        handleAction({
            type: index_1.SHELF_AUTO_ADD_COUNT_CHANGE,
            payload: { autoAddCount: autoAddCount }
        });
    };
    ViewPaneBase.prototype.onGroupByChange = function (event) {
        var handleAction = this.props.handleAction;
        handleAction({
            type: index_1.SHELF_GROUP_BY_CHANGE,
            payload: { groupBy: event.target.value }
        });
    };
    return ViewPaneBase;
}(React.PureComponent));
exports.ViewPane = react_redux_1.connect(function (state) {
    return {
        isQuerySpecific: shelf_1.selectIsQuerySpecific(state),
        bookmark: selectors_1.selectBookmark(state),
        spec: selectors_1.selectMainSpec(state),
        plots: selectors_1.selectPlotList.main(state),
        mainLimit: result_1.selectResultLimit.main(state),
        autoAddCount: shelf_1.selectAutoAddCount(state),
        groupBy: shelf_1.selectShelf(state).groupBy,
        defaultGroupBy: shelf_1.selectDefaultGroupBy(state)
    };
}, redux_action_1.createDispatchHandler())(CSSModules(ViewPaneBase, styles));
//# sourceMappingURL=index.js.map