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
var shelf_1 = require("../../actions/shelf");
var constants_1 = require("../../constants");
var index_1 = require("../field/index");
var styles = require("./encoding-shelf.scss");
var function_picker_1 = require("./function-picker");
;
var EncodingShelfBase = (function (_super) {
    __extends(EncodingShelfBase, _super);
    function EncodingShelfBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EncodingShelfBase.prototype.render = function () {
        var _a = this.props, id = _a.id, connectDropTarget = _a.connectDropTarget, fieldDef = _a.fieldDef;
        var isWildcardShelf = wildcard_1.isWildcard(id.channel);
        var channelName = isWildcardShelf ? 'any' : id.channel;
        return connectDropTarget(React.createElement("div", { styleName: isWildcardShelf ? 'wildcard-shelf' : 'encoding-shelf' },
            React.createElement("div", { styleName: "shelf-label" }, channelName),
            fieldDef ? this.field() : this.fieldPlaceholder()));
    };
    EncodingShelfBase.prototype.onWildcardEnable = function () {
        var _a = this.props, id = _a.id, handleAction = _a.handleAction;
        handleAction({
            type: shelf_1.SPEC_FUNCTION_ENABLE_WILDCARD,
            payload: {
                shelfId: id
            }
        });
    };
    EncodingShelfBase.prototype.onWildcardDisable = function () {
        var _a = this.props, id = _a.id, handleAction = _a.handleAction;
        handleAction({
            type: shelf_1.SPEC_FUNCTION_DISABLE_WILDCARD,
            payload: {
                shelfId: id
            }
        });
    };
    EncodingShelfBase.prototype.onWildcardAdd = function (fn) {
        var _a = this.props, id = _a.id, handleAction = _a.handleAction;
        handleAction({
            type: shelf_1.SPEC_FUNCTION_ADD_WILDCARD,
            payload: {
                shelfId: id,
                fn: fn
            }
        });
    };
    EncodingShelfBase.prototype.onWildcardRemove = function (fn) {
        var _a = this.props, id = _a.id, handleAction = _a.handleAction;
        handleAction({
            type: shelf_1.SPEC_FUNCTION_REMOVE_WILDCARD,
            payload: {
                shelfId: id,
                fn: fn
            }
        });
    };
    EncodingShelfBase.prototype.onFunctionChange = function (fn) {
        var _a = this.props, id = _a.id, handleAction = _a.handleAction;
        handleAction({
            type: shelf_1.SPEC_FUNCTION_CHANGE,
            payload: {
                shelfId: id,
                fn: fn
            }
        });
    };
    EncodingShelfBase.prototype.onRemove = function () {
        var _a = this.props, id = _a.id, handleAction = _a.handleAction;
        handleAction({
            type: shelf_1.SPEC_FIELD_REMOVE,
            payload: id
        });
    };
    EncodingShelfBase.prototype.field = function () {
        var _a = this.props, id = _a.id, fieldDef = _a.fieldDef, schema = _a.schema;
        var renderFunctionPicker = fieldDef.type === 'quantitative' || fieldDef.type === 'temporal';
        var functionPicker = renderFunctionPicker ?
            React.createElement(function_picker_1.FunctionPicker, { fieldDefParts: fieldDef, onFunctionChange: this.onFunctionChange.bind(this), onWildcardEnable: this.onWildcardEnable.bind(this), onWildcardDisable: this.onWildcardDisable.bind(this), onWildcardAdd: this.onWildcardAdd.bind(this), onWildcardRemove: this.onWildcardRemove.bind(this) }) : null;
        return (React.createElement("div", { styleName: 'field-wrapper' },
            React.createElement(index_1.Field, { draggable: true, fieldDef: fieldDef, caretShow: true, isPill: true, schema: schema, popupComponent: functionPicker, onRemove: this.onRemove.bind(this), parentId: { type: constants_1.FieldParentType.ENCODING_SHELF, id: id } })));
    };
    EncodingShelfBase.prototype.fieldPlaceholder = function () {
        var _a = this.props, item = _a.item, isOver = _a.isOver;
        return (React.createElement("span", { styleName: isOver ? 'placeholder-over' : item ? 'placeholder-active' : 'placeholder' }, "Drop a field here"));
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
                    type: shelf_1.SPEC_FIELD_ADD,
                    // TODO(https://github.com/vega/voyager/issues/428):
                    // support inserting a field between two existing fields on the wildcard shelf (replace = false)
                    payload: { shelfId: props.id, fieldDef: fieldDef, replace: true }
                });
                break;
            case constants_1.FieldParentType.ENCODING_SHELF:
                props.handleAction({
                    type: shelf_1.SPEC_FIELD_MOVE,
                    payload: { from: parentId.id, to: props.id }
                });
                break;
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
//# sourceMappingURL=encoding-shelf.js.map