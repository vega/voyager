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
var react_dnd_1 = require("react-dnd");
var styles = require("./field.scss");
var constants_1 = require("../../constants");
;
;
var FieldBase = (function (_super) {
    __extends(FieldBase, _super);
    function FieldBase(props) {
        var _this = _super.call(this, props) || this;
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onAdd = _this.onAdd.bind(_this);
        _this.onDoubleClick = _this.onDoubleClick.bind(_this);
        return _this;
    }
    FieldBase.prototype.render = function () {
        var _a = this.props, caretHide = _a.caretHide, caretOnClick = _a.caretOnClick, connectDragSource = _a.connectDragSource, fieldDef = _a.fieldDef, isPill = _a.isPill;
        var field = fieldDef.field, title = fieldDef.title;
        var isWildcardField = wildcard_1.isWildcard(field) || this.props.isEnumeratedWildcardField;
        var component = (React.createElement("span", { styleName: isWildcardField ? 'wildcard-field-pill' : isPill ? 'field-pill' : 'field', onDoubleClick: this.onDoubleClick },
            caretTypeSpan({ caretHide: caretHide, caretOnClick: caretOnClick, type: fieldDef.type }),
            React.createElement("span", { styleName: "text" }, title || field),
            this.addSpan(),
            this.removeSpan()));
        // Wrap with connect dragSource if it is injected
        return connectDragSource ? connectDragSource(component) : component;
    };
    FieldBase.prototype.addSpan = function () {
        return this.props.onAdd && (React.createElement("span", null,
            React.createElement("a", { onClick: this.onAdd },
                React.createElement("i", { className: "fa fa-plus" }))));
    };
    FieldBase.prototype.removeSpan = function () {
        var onRemove = this.props.onRemove;
        return onRemove && (React.createElement("span", null,
            React.createElement("a", { onClick: onRemove },
                React.createElement("i", { className: "fa fa-times" }))));
    };
    FieldBase.prototype.onAdd = function () {
        this.props.onAdd(this.props.fieldDef);
    };
    FieldBase.prototype.onDoubleClick = function () {
        if (this.props.onDoubleClick) {
            this.props.onDoubleClick(this.props.fieldDef);
        }
    };
    return FieldBase;
}(React.PureComponent));
;
var TYPE_NAMES = {
    nominal: 'text',
    ordinal: 'text-ordinal',
    quantitative: 'number',
    temporal: 'time',
    geographic: 'geo'
};
var TYPE_ICONS = {
    nominal: 'fa-font',
    ordinal: 'fa-font',
    quantitative: 'fa-hashtag',
    temporal: 'fa-calendar',
};
// We combine caret and type span so that it's easier to click
function caretTypeSpan(props) {
    var caretHide = props.caretHide, caretOnClick = props.caretOnClick, type = props.type;
    var icon = TYPE_ICONS[type];
    var title = TYPE_NAMES[type];
    return React.createElement("span", { styleName: "caret-type", onClick: caretOnClick },
        caretOnClick && React.createElement("i", { className: (caretHide ? 'hidden ' : '') + 'fa fa-caret-down' }),
        caretOnClick && ' ',
        type && React.createElement("i", { className: 'fa ' + icon, styleName: "type", title: title }));
}
var fieldSource = {
    beginDrag: function (props) {
        var fieldDef = props.fieldDef, parentId = props.parentId;
        return { fieldDef: fieldDef, parentId: parentId };
    }
};
/**
 * Specifies which props to inject into your component.
 */
var collect = function (connect, monitor) {
    return {
        // Call this function inside render()
        // to let React DnD handle the drag events:
        connectDragSource: connect.dragSource(),
        // You can ask the monitor about the current drag state:
        isDragging: monitor.isDragging()
    };
};
// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
exports.Field = react_dnd_1.DragSource(constants_1.DraggableType.FIELD, fieldSource, collect)(CSSModules(FieldBase, styles));
