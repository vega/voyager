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
var custom_wildcard_field_1 = require("../../actions/custom-wildcard-field");
var index_1 = require("../../actions/index");
var index_2 = require("../field/index");
var styles = require("./wildcard-field-editor.scss");
var CustomWildcardFieldEditorBase = (function (_super) {
    __extends(CustomWildcardFieldEditorBase, _super);
    function CustomWildcardFieldEditorBase(props) {
        var _this = _super.call(this, props) || this;
        _this.onRemoveField = _this.onRemoveField.bind(_this);
        _this.onRemoveWildcard = _this.onRemoveWildcard.bind(_this);
        _this.onDescriptionChange = _this.onDescriptionChange.bind(_this);
        return _this;
    }
    CustomWildcardFieldEditorBase.prototype.render = function () {
        var _this = this;
        var customWildcardFielddef = this.props.customWildcardFielddef;
        var fields = customWildcardFielddef.field.enum.map(function (field, fieldIndex) {
            var fieldObj = { field: field };
            return (React.createElement(index_2.Field, { fieldDef: fieldObj, isPill: false, draggable: false, caretShow: false, onRemove: _this.onRemoveField.bind(_this, field), key: fieldIndex }));
        });
        return (React.createElement("div", { styleName: 'popup-menu' },
            React.createElement("div", { styleName: 'wildcard-menu' },
                React.createElement("div", null,
                    React.createElement("label", { className: 'wildcard-title-label' },
                        React.createElement("h4", null, "Description"),
                        React.createElement("textarea", { type: 'text', placeholder: 'description', value: customWildcardFielddef.description || '', onChange: this.onDescriptionChange }))),
                React.createElement("h4", null, "Wildcard Fields"),
                React.createElement("div", { className: 'wildcard-fields' }, fields),
                React.createElement("a", { styleName: "remove-action", onClick: this.onRemoveWildcard },
                    React.createElement("i", { className: "fa fa-times" }),
                    " Delete Wildcard"))));
    };
    CustomWildcardFieldEditorBase.prototype.onRemoveField = function (field) {
        var _a = this.props, handleAction = _a.handleAction, index = _a.index;
        handleAction({
            type: custom_wildcard_field_1.CUSTOM_WILDCARD_REMOVE_FIELD,
            payload: {
                field: field,
                index: index
            }
        });
    };
    CustomWildcardFieldEditorBase.prototype.onRemoveWildcard = function () {
        var _a = this.props, handleAction = _a.handleAction, index = _a.index;
        handleAction({
            type: index_1.CUSTOM_WILDCARD_REMOVE,
            payload: {
                index: index
            }
        });
    };
    CustomWildcardFieldEditorBase.prototype.onDescriptionChange = function (event) {
        var _a = this.props, handleAction = _a.handleAction, index = _a.index;
        handleAction({
            type: custom_wildcard_field_1.CUSTOM_WILDCARD_MODIFY_DESCRIPTION,
            payload: {
                description: event.target.value,
                index: index
            }
        });
    };
    return CustomWildcardFieldEditorBase;
}(React.PureComponent));
exports.CustomWildcardFieldEditorBase = CustomWildcardFieldEditorBase;
exports.CustomWildcardFieldEditor = CSSModules(CustomWildcardFieldEditorBase, styles);
//# sourceMappingURL=wildcard-field-editor.js.map