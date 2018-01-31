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
var util_1 = require("vega-lite/build/src/util");
var shelf_1 = require("../../models/shelf");
var styles = require("./function-picker.scss");
var FunctionPickerBase = (function (_super) {
    __extends(FunctionPickerBase, _super);
    function FunctionPickerBase(props) {
        var _this = _super.call(this, props) || this;
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onFunctionChange = _this.onFunctionChange.bind(_this);
        _this.onCheck = _this.onCheck.bind(_this);
        _this.onFunctionCheck = _this.onFunctionCheck.bind(_this);
        return _this;
    }
    FunctionPickerBase.prototype.render = function () {
        var _this = this;
        var _a = this.props, fieldDefParts = _a.fieldDefParts, wildcardHandler = _a.wildcardHandler;
        var fn = fieldDefParts.fn, type = fieldDefParts.type;
        var supportedFns = shelf_1.getSupportedFunction(type);
        var fnIsWildcard = wildcard_1.isWildcard(fn);
        var checkboxradios = supportedFns.map(function (f) { return (React.createElement("label", { styleName: "func-label", key: f || '-' },
            React.createElement("input", { onChange: fnIsWildcard ? _this.onFunctionCheck : _this.onFunctionChange, type: fnIsWildcard ? "checkbox" : "radio", checked: wildcard_1.isWildcard(fn) ? util_1.contains(fn.enum, f) : (f === fn), value: f || '-' }),
            ' ',
            f || '-')); });
        return checkboxradios.length > 0 && (React.createElement("div", { styleName: "function-chooser" },
            wildcardHandler && (React.createElement("label", { styleName: "wildcard-button" },
                React.createElement("input", { type: "checkbox", onChange: this.onCheck }),
                " Wildcard")),
            React.createElement("h4", null, "Function"),
            checkboxradios));
    };
    FunctionPickerBase.prototype.onFunctionChange = function (event) {
        var shelfFunction = event.target.value;
        if (shelfFunction === '-') {
            shelfFunction = undefined;
        }
        this.props.onFunctionChange(shelfFunction);
    };
    FunctionPickerBase.prototype.onFunctionCheck = function (event) {
        var checked = event.target.checked;
        var shelfFunction = event.target.value;
        if (shelfFunction === '-') {
            shelfFunction = undefined;
        }
        if (checked) {
            this.props.wildcardHandler.onWildcardAdd(shelfFunction);
        }
        else {
            this.props.wildcardHandler.onWildcardRemove(shelfFunction);
        }
    };
    FunctionPickerBase.prototype.onCheck = function (event) {
        var checked = event.target.checked;
        if (checked) {
            this.props.wildcardHandler.onWildcardEnable();
        }
        else {
            this.props.wildcardHandler.onWildcardDisable();
        }
    };
    return FunctionPickerBase;
}(React.PureComponent));
exports.FunctionPickerBase = FunctionPickerBase;
exports.FunctionPicker = CSSModules(FunctionPickerBase, styles);
// FIXME: move this to other parts and expand with more rules and test?
//# sourceMappingURL=function-picker.js.map