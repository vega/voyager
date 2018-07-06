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
var wildcard_1 = require("compassql/build/src/wildcard");
var React = require("react");
var CSSModules = require("react-css-modules");
var mark_1 = require("vega-lite/build/src/mark");
var styles = require("./mark-picker.scss");
var actions_1 = require("../../actions");
var ALL_MARKS = [wildcard_1.SHORT_WILDCARD].concat(mark_1.PRIMITIVE_MARKS);
var options = ALL_MARKS.map(function (mark) { return (React.createElement("option", { key: mark, value: mark }, mark === wildcard_1.SHORT_WILDCARD ? 'auto' : mark)); });
/**
 * Control for selecting mark type
 */
var MarkPickerBase = (function (_super) {
    __extends(MarkPickerBase, _super);
    function MarkPickerBase(props) {
        var _this = _super.call(this, props) || this;
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onMarkChange = _this.onMarkChange.bind(_this);
        return _this;
    }
    MarkPickerBase.prototype.render = function () {
        var mark = this.props.mark;
        return (React.createElement("select", { styleName: wildcard_1.isWildcard(mark) ? 'mark-picker-any' : 'mark-picker', value: mark, onChange: this.onMarkChange }, options));
    };
    MarkPickerBase.prototype.onMarkChange = function (event) {
        this.props.handleAction({
            type: actions_1.SPEC_MARK_CHANGE_TYPE,
            payload: event.target.value
        });
    };
    return MarkPickerBase;
}(React.PureComponent));
exports.MarkPickerBase = MarkPickerBase;
exports.MarkPicker = CSSModules(MarkPickerBase, styles);
//# sourceMappingURL=mark-picker.js.map