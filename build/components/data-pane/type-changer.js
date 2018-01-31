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
var dataset_1 = require("../../actions/dataset");
var styles = require("./type-changer.scss");
var TypeChangerBase = (function (_super) {
    __extends(TypeChangerBase, _super);
    function TypeChangerBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TypeChangerBase.prototype.render = function () {
        var _this = this;
        var validTypes = this.props.validTypes;
        return (React.createElement("div", { styleName: 'type-changer' },
            React.createElement("h4", null, "Type"),
            validTypes.map(function (validType) {
                return (React.createElement("label", { key: validType },
                    React.createElement("input", { type: 'radio', value: validType, name: 'type', onChange: _this.onTypeChange.bind(_this), checked: _this.props.type === validType }),
                    React.createElement("span", { styleName: 'type' },
                        " ",
                        validType,
                        " ")));
            })));
    };
    TypeChangerBase.prototype.onTypeChange = function (e) {
        var type = e.target.value;
        var _a = this.props, handleAction = _a.handleAction, field = _a.field;
        handleAction({
            type: dataset_1.DATASET_SCHEMA_CHANGE_FIELD_TYPE,
            payload: {
                field: field,
                type: type
            }
        });
    };
    return TypeChangerBase;
}(React.PureComponent));
exports.TypeChangerBase = TypeChangerBase;
exports.TypeChanger = CSSModules(TypeChangerBase, styles);
//# sourceMappingURL=type-changer.js.map