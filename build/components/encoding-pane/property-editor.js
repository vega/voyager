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
var react_jsonschema_form_1 = require("react-jsonschema-form");
var vlSchema = require("vega-lite/build/vega-lite-schema.json");
var spec_1 = require("../../actions/shelf/spec");
var styles = require("./property-editor.scss");
var PropertyEditorBase = (function (_super) {
    __extends(PropertyEditorBase, _super);
    function PropertyEditorBase(props) {
        var _this = _super.call(this, props) || this;
        _this.changeFieldProperty = _this.changeFieldProperty.bind(_this);
        return _this;
    }
    PropertyEditorBase.prototype.render = function () {
        var _a = this.props, prop = _a.prop, nestedProp = _a.nestedProp, fieldDef = _a.fieldDef;
        var uiSchema = {
            "ui:title": prop + " " + nestedProp,
            "ui:placeholder": "auto",
            "ui:emptyValue": "auto"
        };
        var formData = fieldDef.scale ? fieldDef.scale.type : 'auto';
        return (React.createElement("div", { styleName: "property-editor" },
            React.createElement(react_jsonschema_form_1.default, { schema: vlSchema.definitions.ScaleType, uiSchema: uiSchema, formData: formData, onChange: this.changeFieldProperty },
                React.createElement("button", { type: "submit", style: { display: 'none' } }, "Submit"))));
    };
    PropertyEditorBase.prototype.changeFieldProperty = function (result) {
        var _a = this.props, prop = _a.prop, nestedProp = _a.nestedProp, shelfId = _a.shelfId, handleAction = _a.handleAction;
        var value = result.formData;
        handleAction({
            type: spec_1.SPEC_FIELD_NESTED_PROP_CHANGE,
            payload: {
                shelfId: shelfId,
                prop: prop,
                nestedProp: nestedProp,
                value: value
            }
        });
    };
    return PropertyEditorBase;
}(React.PureComponent));
exports.PropertyEditorBase = PropertyEditorBase;
exports.PropertyEditor = CSSModules(PropertyEditorBase, styles);
//# sourceMappingURL=property-editor.js.map