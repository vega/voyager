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
var react_modal_1 = require("react-modal");
var react_redux_1 = require("react-redux");
var redux_action_1 = require("../../actions/redux-action");
var plot_1 = require("../plot");
var styles = require("./bookmark.scss");
var BookmarkBase = (function (_super) {
    __extends(BookmarkBase, _super);
    function BookmarkBase(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { modalIsOpen: false };
        _this.openModal = _this.openModal.bind(_this);
        _this.closeModal = _this.closeModal.bind(_this);
        return _this;
    }
    BookmarkBase.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("button", { onClick: this.openModal },
                React.createElement("i", { className: 'fa fa-bookmark' }),
                " Bookmarks (",
                this.props.bookmark.count,
                ")"),
            React.createElement(react_modal_1.default, { isOpen: this.state.modalIsOpen, onRequestClose: this.closeModal, contentLabel: "Bookmark Selector", styleName: "modal" }, this.renderBookmarks(this.props.bookmark))));
    };
    BookmarkBase.prototype.openModal = function () {
        this.setState({ modalIsOpen: true });
    };
    BookmarkBase.prototype.closeModal = function () {
        this.setState({ modalIsOpen: false });
    };
    BookmarkBase.prototype.renderBookmarks = function (bookmark) {
        var _this = this;
        var plots = bookmark.list.map(function (key) { return bookmark.dict[key].plotObject; });
        var bookmarkPlotListItems = plots.map(function (plot) {
            var spec = plot.spec, fieldInfos = plot.fieldInfos;
            var specKey = JSON.stringify(spec);
            return (React.createElement(plot_1.Plot, { bookmark: _this.props.bookmark, key: specKey, fieldInfos: fieldInfos, handleAction: _this.props.handleAction, isPlotListItem: true, scrollOnHover: true, showBookmarkButton: true, showSpecifyButton: true, spec: spec }));
        });
        return (React.createElement("div", null, bookmarkPlotListItems));
    };
    return BookmarkBase;
}(React.PureComponent));
exports.BookmarkBase = BookmarkBase;
var BookmarkRenderer = CSSModules(BookmarkBase, styles);
exports.BookmarkPane = react_redux_1.connect(function (state) {
    return {
        bookmark: state.present.bookmark
    };
}, redux_action_1.createDispatchHandler())(BookmarkRenderer);
