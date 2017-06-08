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
var React = require("react");
var CSSModules = require("react-css-modules");
var react_redux_1 = require("react-redux");
var styles = require("./field-list.scss");
var redux_action_1 = require("../../actions/redux-action");
var shelf_1 = require("../../actions/shelf");
var constants_1 = require("../../constants");
var selectors_1 = require("../../selectors");
var field_1 = require("../field");
var FieldListBase = (function (_super) {
    __extends(FieldListBase, _super);
    function FieldListBase(props) {
        var _this = _super.call(this, props) || this;
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onAdd = _this.onAdd.bind(_this);
        return _this;
    }
    FieldListBase.prototype.render = function () {
        var _this = this;
        var fieldDefs = this.props.fieldDefs;
        var fieldItems = fieldDefs.map(function (fieldDef) {
            return (React.createElement("div", { key: JSON.stringify(fieldDef), styleName: "field-list-item" },
                React.createElement(field_1.Field, { fieldDef: fieldDef, isPill: true, draggable: true, parentId: { type: constants_1.FieldParentType.FIELD_LIST }, onDoubleClick: _this.onAdd, onAdd: _this.onAdd })));
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
    return FieldListBase;
}(React.PureComponent));
var FieldListRenderer = CSSModules(FieldListBase, styles);
exports.FieldList = react_redux_1.connect(function (state) {
    return {
        fieldDefs: selectors_1.getSchemaFieldDefs(state).concat([
            { aggregate: 'count', field: '*', type: 'quantitative', title: 'Number of Records' }
        ])
    };
}, redux_action_1.createDispatchHandler())(FieldListRenderer);
exports.PresetWildcardFieldList = react_redux_1.connect(function (state) {
    return {
        fieldDefs: selectors_1.getPresetWildcardFields(state)
    };
}, redux_action_1.createDispatchHandler())(FieldListRenderer);
