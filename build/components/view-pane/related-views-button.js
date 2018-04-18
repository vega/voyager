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
var related_views_1 = require("../../actions/related-views");
var styles = require("./related-views-button.scss");
var RelatedViewsButtonBase = (function (_super) {
    __extends(RelatedViewsButtonBase, _super);
    function RelatedViewsButtonBase(props) {
        var _this = _super.call(this, props) || this;
        _this.onHideClick = _this.onHideClick.bind(_this);
        return _this;
    }
    RelatedViewsButtonBase.prototype.render = function () {
        var collapseRelatedViews = this.props.collapseRelatedViews;
        return (React.createElement("div", { styleName: "right" },
            React.createElement("a", { onClick: this.onHideClick },
                collapseRelatedViews ? 'Expand' : 'Collapse',
                "\u00A0\u00A0",
                collapseRelatedViews ? React.createElement("i", { className: 'fa fa-toggle-up' }) : React.createElement("i", { className: 'fa fa-toggle-down' }))));
    };
    RelatedViewsButtonBase.prototype.onHideClick = function () {
        var collapseRelatedViews = this.props.collapseRelatedViews;
        this.props.handleAction({
            type: related_views_1.RELATED_VIEWS_HIDE_TOGGLE,
            payload: {
                newIsCollapsed: !collapseRelatedViews
            }
        });
    };
    return RelatedViewsButtonBase;
}(React.PureComponent));
exports.RelatedViewsButtonBase = RelatedViewsButtonBase;
exports.RelatedViewsButton = (CSSModules(RelatedViewsButtonBase, styles));
//# sourceMappingURL=related-views-button.js.map