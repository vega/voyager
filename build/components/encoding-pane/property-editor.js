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
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var React = require("react");
var CSSModules = require("react-css-modules");
var react_jsonschema_form_1 = require("react-jsonschema-form");
var throttle_debounce_1 = require("throttle-debounce");
var shelf_1 = require("../../actions/shelf");
var spec_1 = require("../../models/shelf/spec");
var property_editor_schema_1 = require("./property-editor-schema");
var styles = require("./property-editor.scss");
var PropertyEditorBase = (function (_super) {
    __extends(PropertyEditorBase, _super);
    function PropertyEditorBase(props) {
        var _this = _super.call(this, props) || this;
        _this.changeFieldProperty = _this.changeFieldProperty.bind(_this);
        _this.changeFieldProperty = throttle_debounce_1.debounce(500, _this.changeFieldProperty);
        return _this;
    }
    PropertyEditorBase.prototype.render = function () {
        var _a = this.props, prop = _a.prop, nestedProp = _a.nestedProp, propTab = _a.propTab, shelfId = _a.shelfId, fieldDef = _a.fieldDef;
        if (!spec_1.isWildcardChannelId(shelfId)) {
            var _b = property_editor_schema_1.generatePropertyEditorSchema(prop, nestedProp, propTab, fieldDef, shelfId.channel), schema = _b.schema, uiSchema = _b.uiSchema;
            var formData = property_editor_schema_1.generateFormData(shelfId, fieldDef);
            return (React.createElement("div", { styleName: "property-editor" },
                React.createElement(react_jsonschema_form_1.default, { schema: schema, uiSchema: uiSchema, formData: formData, onChange: this.changeFieldProperty },
                    React.createElement("button", { type: "submit", style: { display: 'none' } }, "Submit"))));
        }
    };
    PropertyEditorBase.prototype.changeFieldProperty = function (result) {
        var _a = this.props, prop = _a.prop, nestedProp = _a.nestedProp, shelfId = _a.shelfId, handleAction = _a.handleAction;
        var value = this.parseFormDataResult(result.formData[Object.keys(result.formData)[0]]);
        if (nestedProp) {
            handleAction({
                type: shelf_1.SPEC_FIELD_NESTED_PROP_CHANGE,
                payload: {
                    shelfId: shelfId,
                    prop: prop,
                    nestedProp: nestedProp,
                    value: value
                }
            });
        }
        else {
            handleAction({
                type: shelf_1.SPEC_FIELD_PROP_CHANGE,
                payload: {
                    shelfId: shelfId,
                    prop: prop,
                    value: value
                }
            });
        }
    };
    PropertyEditorBase.prototype.parseFormDataResult = function (result) {
        var _a = this.props, fieldDef = _a.fieldDef, prop = _a.prop, nestedProp = _a.nestedProp;
        var reg = /\s*,\s*/; // regex for parsing comma delimited strings
        if (result === '') {
            return undefined;
        }
        if (prop === 'scale') {
            if (nestedProp === 'range') {
                var range = result.split(reg);
                if (property_editor_schema_1.isContinuous(fieldDef) && range.length !== 2) {
                    throw new Error('Invalid format for range. Must follow format: Min Number, Max Number');
                }
                return result === '' ? undefined : range;
            }
            else if (nestedProp === 'domain') {
                var domain = result.split(reg);
                if (fieldDef.type === expandedtype_1.ExpandedType.QUANTITATIVE && domain.length !== 2) {
                    throw new Error('Invalid format for domain. Must follow format: Min Number, Max Number');
                }
                else if (fieldDef.type === expandedtype_1.ExpandedType.TEMPORAL) {
                    // TODO: Not supported yet
                    throw new Error('Voyager does not currently support temporal domain values');
                }
                return result === '' ? undefined : domain;
            }
        }
        // if form data is empty, default to auto suggested view, which is ? in compass
        return result === '' ? undefined : result;
    };
    return PropertyEditorBase;
}(React.PureComponent));
exports.PropertyEditorBase = PropertyEditorBase;
exports.PropertyEditor = CSSModules(PropertyEditorBase, styles);
//# sourceMappingURL=property-editor.js.map