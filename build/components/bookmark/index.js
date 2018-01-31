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
var React = require("react");
var CSSModules = require("react-css-modules");
var react_modal_1 = require("react-modal");
var react_redux_1 = require("react-redux");
var bookmark_1 = require("../../actions/bookmark");
var redux_action_1 = require("../../actions/redux-action");
var dataset_1 = require("../../selectors/dataset");
var index_1 = require("../../selectors/index");
var plot_1 = require("../plot");
var styles = require("./bookmark.scss");
var BookmarkBase = (function (_super) {
    __extends(BookmarkBase, _super);
    function BookmarkBase(props) {
        var _this = _super.call(this, props) || this;
        _this.state = { modalIsOpen: false };
        _this.openModal = _this.openModal.bind(_this);
        _this.closeModal = _this.closeModal.bind(_this);
        _this.onClearAll = _this.onClearAll.bind(_this);
        _this.onExport = _this.onExport.bind(_this);
        return _this;
    }
    BookmarkBase.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("button", { onClick: this.openModal },
                React.createElement("i", { className: "fa fa-bookmark" }),
                " Bookmarks (",
                this.props.bookmark.count,
                ")"),
            React.createElement(react_modal_1.default, { isOpen: this.state.modalIsOpen, onRequestClose: this.closeModal, contentLabel: "Bookmark Selector", styleName: "modal", className: "voyager" },
                React.createElement("div", { className: "modal-header" },
                    React.createElement("a", { className: "right", onClick: this.closeModal }, "Close"),
                    React.createElement("h3", null,
                        "Bookmarks (",
                        this.props.bookmark.count,
                        ")"),
                    React.createElement("a", { styleName: "bookmark-list-util", onClick: this.onClearAll },
                        React.createElement("i", { className: "fa fa-trash-o" }),
                        ' ',
                        "Clear all"),
                    React.createElement("a", { styleName: "bookmark-list-util", onClick: this.onExport },
                        React.createElement("i", { className: "fa fa-clipboard" }),
                        ' ',
                        "Export")),
                this.renderBookmarks(this.props.bookmark))));
    };
    BookmarkBase.prototype.onExport = function () {
        var bookmark = this.props.bookmark;
        var specs = [];
        for (var _i = 0, _a = bookmark.list; _i < _a.length; _i++) {
            var specKey = _a[_i];
            var bookmarkItem = bookmark.dict[specKey];
            specs.push(__assign({}, bookmarkItem.plot.spec, { description: bookmarkItem.note }));
        }
        var exportWindow = window.open();
        exportWindow.document.write("<html><body><pre>" +
            JSON.stringify(specs, null, 2) +
            "</pre></body></html>");
        exportWindow.document.close();
    };
    BookmarkBase.prototype.onClearAll = function () {
        this.props.handleAction({ type: bookmark_1.BOOKMARK_CLEAR_ALL });
    };
    BookmarkBase.prototype.openModal = function () {
        this.setState({ modalIsOpen: true });
    };
    BookmarkBase.prototype.closeModal = function () {
        this.setState({ modalIsOpen: false });
    };
    BookmarkBase.prototype.renderBookmarks = function (bookmark) {
        var _this = this;
        var data = this.props.data;
        var plots = bookmark.list.map(function (key) { return bookmark.dict[key].plot; });
        var bookmarkPlotListItems = plots.map(function (plot, index) {
            var spec = plot.spec, fieldInfos = plot.fieldInfos;
            return (React.createElement(plot_1.Plot, { bookmark: _this.props.bookmark, closeModal: _this.closeModal.bind(_this), data: data, filters: [], key: index, fieldInfos: fieldInfos, handleAction: _this.props.handleAction, isPlotListItem: true, showBookmarkButton: true, showSpecifyButton: true, spec: spec }));
        });
        return (React.createElement("div", null, (bookmarkPlotListItems.length > 0) ?
            bookmarkPlotListItems :
            React.createElement("div", { styleName: "vis-list-empty" }, "You have no bookmarks")));
    };
    return BookmarkBase;
}(React.PureComponent));
exports.BookmarkBase = BookmarkBase;
var BookmarkRenderer = CSSModules(BookmarkBase, styles);
exports.BookmarkPane = react_redux_1.connect(function (state) {
    return {
        bookmark: index_1.selectBookmark(state),
        data: dataset_1.selectData(state)
    };
}, redux_action_1.createDispatchHandler())(BookmarkRenderer);
//# sourceMappingURL=index.js.map