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
var schema_1 = require("compassql/build/src/schema");
var wildcard_1 = require("compassql/build/src/wildcard");
var stringify = require("json-stable-stringify");
var React = require("react");
var CSSModules = require("react-css-modules");
var react_redux_1 = require("react-redux");
var redux_action_1 = require("../../actions/redux-action");
var shelf_1 = require("../../actions/shelf");
var filter_1 = require("../../actions/shelf/filter");
var constants_1 = require("../../constants");
var filter_2 = require("../../models/shelf/filter");
var selectors_1 = require("../../selectors");
var shelf_2 = require("../../selectors/shelf");
var field_1 = require("../field");
var styles = require("./field-list.scss");
var type_changer_1 = require("./type-changer");
var FieldListBase = (function (_super) {
    __extends(FieldListBase, _super);
    function FieldListBase(props) {
        var _this = _super.call(this, props) || this;
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onAdd = _this.onAdd.bind(_this);
        _this.onFilterToggle = _this.onFilterToggle.bind(_this);
        return _this;
    }
    FieldListBase.prototype.render = function () {
        var _this = this;
        var _a = this.props, fieldDefs = _a.fieldDefs, schema = _a.schema;
        var fieldItems = fieldDefs.map(function (fieldDef) {
            var primitiveType;
            if (!wildcard_1.isWildcard(fieldDef.field)) {
                primitiveType = schema.primitiveType(fieldDef.field);
            }
            var hideTypeChanger = _this.getValidTypes(primitiveType).length < 2;
            var key = wildcard_1.isWildcard(fieldDef.field) ? stringify(fieldDef) : fieldDef.field;
            return (React.createElement("div", { key: key, styleName: "field-list-item" }, _this.renderComponent(fieldDef, hideTypeChanger, primitiveType)));
        });
        return (React.createElement("div", { styleName: 'field-list' }, fieldItems));
    };
    FieldListBase.prototype.onAdd = function (fieldDef) {
        var handleAction = this.props.handleAction;
        handleAction({
            type: shelf_1.SPEC_FIELD_AUTO_ADD,
            payload: { fieldDef: fieldDef }
        });
    };
    FieldListBase.prototype.onFilterToggle = function (fieldDef) {
        var handleAction = this.props.handleAction;
        handleAction({
            type: filter_1.FILTER_TOGGLE,
            payload: {
                filter: this.getFilter(fieldDef)
            }
        });
    };
    FieldListBase.prototype.getFilter = function (fieldDef) {
        var schema = this.props.schema;
        if (wildcard_1.isWildcard(fieldDef.field)) {
            return;
        }
        var domain = schema.domain({ field: fieldDef.field });
        return filter_2.createDefaultFilter(fieldDef, domain);
    };
    FieldListBase.prototype.renderComponent = function (fieldDef, hideTypeChanger, primitiveType) {
        if (hideTypeChanger) {
            return this.renderField(fieldDef);
        }
        else {
            var popupComponent = this.renderTypeChanger(fieldDef, primitiveType);
            return this.renderField(fieldDef, popupComponent);
        }
    };
    FieldListBase.prototype.renderTypeChanger = function (fieldDef, primitiveType) {
        var handleAction = this.props.handleAction;
        if (!wildcard_1.isWildcard(fieldDef.field)) {
            return (React.createElement(type_changer_1.TypeChanger, { field: fieldDef.field, type: fieldDef.type, validTypes: this.getValidTypes(primitiveType), handleAction: handleAction }));
        }
    };
    FieldListBase.prototype.renderField = function (fieldDef, popupComponent) {
        var _a = this.props, schema = _a.schema, filters = _a.filters;
        var filter = {
            active: !wildcard_1.isWildcard(fieldDef.field) && filter_2.filterHasField(filters, fieldDef.field),
            onToggle: this.onFilterToggle
        };
        return (React.createElement(field_1.Field, { fieldDef: fieldDef, isPill: true, draggable: true, filter: filter, parentId: { type: constants_1.FieldParentType.FIELD_LIST }, caretShow: true, popupComponent: popupComponent, onDoubleClick: this.onAdd, onAdd: this.onAdd, schema: schema }));
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
        fieldDefs: selectors_1.selectSchemaFieldDefs(state).concat([
            { fn: 'count', field: '*', type: 'quantitative' }
        ]),
        schema: selectors_1.selectSchema(state),
        filters: shelf_2.selectFilters(state)
    };
}, redux_action_1.createDispatchHandler())(FieldListRenderer);
exports.PresetWildcardFieldList = react_redux_1.connect(function (state) {
    return {
        fieldDefs: selectors_1.selectPresetWildcardFields(state),
        schema: selectors_1.selectSchema(state)
    };
}, redux_action_1.createDispatchHandler())(FieldListRenderer);
//# sourceMappingURL=field-list.js.map