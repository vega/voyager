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
var Bookmark = (function (_super) {
    __extends(Bookmark, _super);
    function Bookmark() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Bookmark.prototype.render = function () {
        return (React.createElement("button", null,
            React.createElement("i", { className: 'fa fa-bookmark' }),
            " Bookmarks (0)"));
    };
    return Bookmark;
}(React.PureComponent));
exports.Bookmark = Bookmark;
