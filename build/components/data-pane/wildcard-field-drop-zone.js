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
var custom_wildcard_field_1 = require("../../actions/custom-wildcard-field");
var constants_1 = require("../../constants");
var styles = require("./wildcard-field-drop-zone.scss");
;
var CustomWildcardFieldDropZoneBase = (function (_super) {
    __extends(CustomWildcardFieldDropZoneBase, _super);
    function CustomWildcardFieldDropZoneBase(props) {
        return _super.call(this, props) || this;
    }
    CustomWildcardFieldDropZoneBase.prototype.render = function () {
        var _a = this.props, connectDropTarget = _a.connectDropTarget, canDrop = _a.canDrop;
        var styleName, text;
        if (canDrop) {
            styleName = 'drop-zone-can-drop';
            text = 'Drop to create a custom wildcard field';
        }
        else {
            styleName = 'drop-zone';
            text = '';
        }
        return connectDropTarget(React.createElement("div", { styleName: styleName }, text));
    };
    return CustomWildcardFieldDropZoneBase;
}(React.PureComponent));
var customWildcardFieldTarget = {
    drop: function (props, monitor) {
        if (monitor.didDrop()) {
            return;
        }
        var fieldDef = monitor.getItem().fieldDef;
        var type = fieldDef.type;
        var fields;
        if (wildcard_1.isWildcard(fieldDef.field)) {
            if (fieldDef.field === wildcard_1.SHORT_WILDCARD) {
                var schema_1 = props.schema;
                fields = schema_1.fieldNames()
                    .filter(function (field) { return schema_1.vlType(field) === type; });
            }
            else {
                fields = fieldDef.field.enum;
            }
        }
        else {
            fields = [fieldDef.field];
        }
        props.handleAction({
            type: custom_wildcard_field_1.CUSTOM_WILDCARD_ADD,
            payload: {
                fields: fields,
                type: type
            }
        });
    },
    canDrop: function (props, monitor) {
        var fieldDef = monitor.getItem().fieldDef;
        return fieldDef.field !== '*';
    }
};
var collect = function (connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        item: monitor.getItem(),
        canDrop: monitor.canDrop()
    };
};
// HACK: do type casting to suppress compile error for: https://github.com/Microsoft/TypeScript/issues/13526
exports.CustomWildcardFieldDropZone = react_dnd_1.DropTarget(constants_1.DraggableType.FIELD, customWildcardFieldTarget, collect)(CSSModules(CustomWildcardFieldDropZoneBase, styles));
//# sourceMappingURL=wildcard-field-drop-zone.js.map