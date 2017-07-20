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
var react_redux_1 = require("react-redux");
var TetherComponent = require("react-tether");
var styles = require("./field-list.scss");
var expandedtype_1 = require("compassql/build/src/query/expandedtype");
var schema_1 = require("compassql/build/src/schema");
var redux_action_1 = require("../../actions/redux-action");
var shelf_1 = require("../../actions/shelf");
var constants_1 = require("../../constants");
var selectors_1 = require("../../selectors");
var field_1 = require("../field");
var type_changer_1 = require("./type-changer");
var FieldListBase = (function (_super) {
    __extends(FieldListBase, _super);
    function FieldListBase(props) {
        var _this = _super.call(this, props) || this;
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onAdd = _this.onAdd.bind(_this);
        _this.state = {
            selectedField: null
        };
        return _this;
    }
    FieldListBase.prototype.render = function () {
        var _this = this;
        var _a = this.props, fieldDefs = _a.fieldDefs, schema = _a.schema;
        var fieldItems = fieldDefs.map(function (fieldDef) {
            var primitiveType;
            if (typeof fieldDef.field === 'string') {
                primitiveType = schema.primitiveType(fieldDef.field);
            }
            var hideTypeChanger = _this.getValidTypes(primitiveType).length < 2;
            return (React.createElement("div", { key: JSON.stringify(fieldDef), styleName: "field-list-item" }, _this.renderComponent(fieldDef, hideTypeChanger, primitiveType)));
        });
        return (React.createElement("div", { className: "FieldList" }, fieldItems));
    };
    FieldListBase.prototype.onAdd = function (fieldDef) {
        var handleAction = this.props.handleAction;
        handleAction({
            type: shelf_1.SHELF_FIELD_AUTO_ADD,
            payload: { fieldDef: fieldDef }
        });
    };
    FieldListBase.prototype.renderComponent = function (fieldDef, hideTypeChanger, primitiveType) {
        if (hideTypeChanger) {
            return this.renderField(fieldDef, hideTypeChanger);
        }
        else {
            return (React.createElement(TetherComponent, { attachment: "top left", targetAttachment: "bottom left" },
                this.renderField(fieldDef, hideTypeChanger),
                this.renderTypeChanger(fieldDef, primitiveType)));
        }
    };
    FieldListBase.prototype.renderTypeChanger = function (fieldDef, primitiveType) {
        var handleAction = this.props.handleAction;
        if (typeof fieldDef.field === 'string' && this.state.selectedField === fieldDef.field) {
            return (React.createElement(type_changer_1.TypeChanger, { field: fieldDef.field, type: fieldDef.type, validTypes: this.getValidTypes(primitiveType), handleAction: handleAction }));
        }
    };
    FieldListBase.prototype.renderField = function (fieldDef, hideTypeChanger) {
        return (React.createElement(field_1.Field, { fieldDef: fieldDef, isPill: true, draggable: true, parentId: { type: constants_1.FieldParentType.FIELD_LIST }, caretHide: hideTypeChanger, caretOnClick: this.handleCaretClick.bind(this, fieldDef.field), onDoubleClick: this.onAdd, onAdd: this.onAdd }));
    };
    FieldListBase.prototype.handleCaretClick = function (field) {
        if (this.state.selectedField === field) {
            this.setState({
                selectedField: null
            });
        }
        else {
            this.setState({
                selectedField: field
            });
        }
    };
    FieldListBase.prototype.getValidTypes = function (primitiveType) {
        switch (primitiveType) {
            case schema_1.PrimitiveType.NUMBER:
                return [expandedtype_1.ExpandedType.QUANTITATIVE, expandedtype_1.ExpandedType.NOMINAL];
            case schema_1.PrimitiveType.INTEGER:
                return [expandedtype_1.ExpandedType.QUANTITATIVE, expandedtype_1.ExpandedType.NOMINAL];
            case schema_1.PrimitiveType.DATETIME:
                return [expandedtype_1.ExpandedType.TEMPORAL];
            case schema_1.PrimitiveType.STRING:
                return [expandedtype_1.ExpandedType.NOMINAL];
            case schema_1.PrimitiveType.BOOLEAN:
                return [expandedtype_1.ExpandedType.NOMINAL];
            default:
                return [];
        }
    };
    return FieldListBase;
}(React.PureComponent));
var FieldListRenderer = CSSModules(FieldListBase, styles);
exports.FieldList = react_redux_1.connect(function (state) {
    return {
        fieldDefs: selectors_1.getSchemaFieldDefs(state).concat([
            { aggregate: 'count', field: '*', type: 'quantitative', title: 'Number of Records' }
        ]),
        schema: selectors_1.getSchema(state)
    };
}, redux_action_1.createDispatchHandler())(FieldListRenderer);
exports.PresetWildcardFieldList = react_redux_1.connect(function (state) {
    return {
        fieldDefs: selectors_1.getPresetWildcardFields(state),
        schema: selectors_1.getSchema(state)
    };
}, redux_action_1.createDispatchHandler())(FieldListRenderer);
