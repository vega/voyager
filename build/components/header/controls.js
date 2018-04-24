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
var bookmark_1 = require("../bookmark");
var styles = require("./controls.scss");
var undo_redo_1 = require("./undo-redo");
var ControlsBase = (function (_super) {
    __extends(ControlsBase, _super);
    function ControlsBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ControlsBase.prototype.render = function () {
        return (React.createElement("div", { styleName: 'controls' },
            React.createElement(bookmark_1.BookmarkPane, null),
            React.createElement(undo_redo_1.UndoRedo, null)));
    };
    return ControlsBase;
}(React.PureComponent));
exports.ControlsBase = ControlsBase;
;
exports.Controls = CSSModules(ControlsBase, styles);
//# sourceMappingURL=controls.js.map