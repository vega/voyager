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
var wildcard_1 = require("compassql/build/src/wildcard");
var React = require("react");
var CSSModules = require("react-css-modules");
var react_dnd_1 = require("react-dnd");
var TetherComponent = require("react-tether");
var styles = require("./encoding-shelf.scss");
var shelf_1 = require("../../actions/shelf");
var constants_1 = require("../../constants");
var index_1 = require("../field/index");
var function_picker_1 = require("./function-picker");
;
var EncodingShelfBase = (function (_super) {
    __extends(EncodingShelfBase, _super);
    function EncodingShelfBase(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            functionPopupOpen: false
        };
        // Bind - https://facebook.github.io/react/docs/handling-events.html
        _this.onFunctionChange = _this.onFunctionChange.bind(_this);
        _this.onRemove = _this.onRemove.bind(_this);
        _this.toggleFunctionPopup = _this.toggleFunctionPopup.bind(_this);
        return _this;
    }
    EncodingShelfBase.prototype.render = function () {
        var _a = this.props, id = _a.id, connectDropTarget = _a.connectDropTarget, fieldDef = _a.fieldDef;
        var isWildcardShelf = wildcard_1.isWildcard(id.channel);
        var channelName = isWildcardShelf ? 'any' : id.channel;
        return connectDropTarget(React.createElement("div", { styleName: isWildcardShelf ? 'wildcard-shelf' : 'encoding-shelf' },
            React.createElement("div", { styleName: "shelf-label" }, channelName),
            fieldDef ? this.field() : this.fieldPlaceholder()));
    };
    // TODO: consider extracting this to another file
    EncodingShelfBase.prototype.field = function () {
        var _a = this.props, id = _a.id, fieldDef = _a.fieldDef;
        var caretHide = !(fieldDef.type === 'quantitative' || fieldDef.type === 'temporal');
        // TODO: apply is over
        // TODO(https://github.com/vega/voyager/issues/285): support clicking outside popup to disable
        return (React.createElement("div", { styleName: "field-wrapper" },
            React.createElement(TetherComponent, { attachment: "top left", targetAttachment: "bottom left" },
                React.createElement(index_1.Field, { fieldDef: fieldDef, caretOnClick: this.toggleFunctionPopup, caretHide: caretHide, isPill: true, parentId: { type: constants_1.FieldParentType.ENCODING_SHELF, id: id }, draggable: true, onRemove: this.onRemove }),
                this.state.functionPopupOpen &&
                    React.createElement(function_picker_1.FunctionPicker, { fieldDef: fieldDef, onFunctionChange: this.onFunctionChange }))));
    };
    EncodingShelfBase.prototype.toggleFunctionPopup = function () {
        this.setState({
            functionPopupOpen: !this.state.functionPopupOpen
        });
    };
    EncodingShelfBase.prototype.fieldPlaceholder = function () {
        var _a = this.props, item = _a.item, isOver = _a.isOver;
        return (React.createElement("span", { styleName: isOver ? 'placeholder-over' : item ? 'placeholder-active' : 'placeholder' }, "Drop a field here"));
    };
    EncodingShelfBase.prototype.onRemove = function () {
        var _a = this.props, id = _a.id, handleAction = _a.handleAction;
        handleAction({
            type: shelf_1.SHELF_FIELD_REMOVE,
            payload: id
        });
    };
    EncodingShelfBase.prototype.onFunctionChange = function (fn) {
        var _a = this.props, id = _a.id, handleAction = _a.handleAction;
        handleAction({
            type: shelf_1.SHELF_FUNCTION_CHANGE,
            payload: {
                shelfId: id,
                fn: fn
            }
        });
    };
    return EncodingShelfBase;
}(React.PureComponent));
var encodingShelfTarget = {
    // TODO: add canDrop
    drop: function (props, monitor) {
        // Don't drop twice for nested drop target
        if (monitor.didDrop()) {
            return;
        }
        var _a = monitor.getItem(), fieldDef = _a.fieldDef, parentId = _a.parentId;
        switch (parentId.type) {
            case constants_1.FieldParentType.FIELD_LIST:
                props.handleAction({
                    type: shelf_1.SHELF_FIELD_ADD,
                    payload: { shelfId: props.id, fieldDef: fieldDef } // TODO: rename to to:
                });
                break;
            case constants_1.FieldParentType.ENCODING_SHELF:
                props.handleAction({
                    type: shelf_1.SHELF_FIELD_MOVE,
                    payload: { from: parentId.id, to: props.id }
                });
            default:
                throw new Error('Field dragged from unregistered source type to EncodingShelf');
        }
    }
};
var collect = function (connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        item: monitor.getItem()
    };
};
// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
exports.EncodingShelf = react_dnd_1.DropTarget(constants_1.DraggableType.FIELD, encodingShelfTarget, collect)(CSSModules(EncodingShelfBase, styles));
