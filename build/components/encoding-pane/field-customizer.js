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
var styles = require("./field-customizer.scss");
var property_editor_1 = require("./property-editor");
var FieldCustomizerBase = (function (_super) {
    __extends(FieldCustomizerBase, _super);
    function FieldCustomizerBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FieldCustomizerBase.prototype.render = function () {
        var _a = this.props, shelfId = _a.shelfId, handleAction = _a.handleAction, fieldDef = _a.fieldDef;
        return (React.createElement("div", { styleName: 'customizer-container' }, this.customizableProps().map(function (customizableProp) {
            var prop = customizableProp.prop, nestedProp = customizableProp.nestedProp;
            return (React.createElement(property_editor_1.PropertyEditor, { key: JSON.stringify({ prop: prop, nestedProp: nestedProp }), prop: prop, nestedProp: nestedProp, shelfId: shelfId, fieldDef: fieldDef, handleAction: handleAction }));
        })));
    };
    FieldCustomizerBase.prototype.customizableProps = function () {
        return [{
                prop: 'scale',
                nestedProp: 'type'
            }];
    };
    return FieldCustomizerBase;
}(React.PureComponent));
exports.FieldCustomizerBase = FieldCustomizerBase;
exports.FieldCustomizer = CSSModules(FieldCustomizerBase, styles);
//# sourceMappingURL=field-customizer.js.map