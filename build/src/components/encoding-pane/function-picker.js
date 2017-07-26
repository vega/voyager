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
var styles = require("./function-picker.scss");
var FunctionPickerBase = (function (_super) {
    __extends(FunctionPickerBase, _super);
    function FunctionPickerBase(props) {
        var _this = _super.call(this, props) || this;
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onFunctionChange = _this.onFunctionChange.bind(_this);
        return _this;
    }
    FunctionPickerBase.prototype.render = function () {
        var _this = this;
        var fieldDef = this.props.fieldDef;
        var fn = fieldDef.aggregate || fieldDef.timeUnit || (fieldDef.bin && 'bin') || undefined;
        var supportedFns = getSupportedFunction(fieldDef.type);
        var radios = supportedFns.map(function (f) { return (React.createElement("label", { styleName: "func-label", key: f || '-' },
            React.createElement("input", { type: "radio", value: f, checked: f === fn, onChange: _this.onFunctionChange }),
            ' ',
            f || '-')); });
        if (wildcard_1.isWildcard(fn)) {
            throw new Error('Wildcard function not supported yet');
        }
        else {
            return radios.length > 0 && (React.createElement("div", { styleName: "function-chooser" },
                React.createElement("h4", null, "Function"),
                radios));
        }
    };
    FunctionPickerBase.prototype.onFunctionChange = function (event) {
        this.props.onFunctionChange(event.target.value);
    };
    return FunctionPickerBase;
}(React.PureComponent));
exports.FunctionPickerBase = FunctionPickerBase;
exports.FunctionPicker = CSSModules(FunctionPickerBase, styles);
// FIXME: move this to other parts and expand with more rules and test?
function getSupportedFunction(type) {
    switch (type) {
        case 'quantitative':
            return [
                undefined,
                'bin',
                'min', 'max', 'mean', 'median', 'sum'
            ];
        case 'temporal':
            return [
                undefined,
                'yearmonthdate',
                'year', 'month',
                'date', 'day',
                'hours', 'minutes',
                'seconds', 'milliseconds'
            ];
    }
    return [];
}
