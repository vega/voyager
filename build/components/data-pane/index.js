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
var _1 = require("../../selectors/");
var data_selector_1 = require("../data-selector");
var styles = require("./data-pane.scss");
var field_list_1 = require("./field-list");
var DataPanelBase = (function (_super) {
    __extends(DataPanelBase, _super);
    function DataPanelBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPanelBase.prototype.render = function () {
        var name = this.props.data.name;
        var fieldCount = this.props.data.schema.fieldSchemas.length;
        var showDataSourceSelector = this.props.config.showDataSourceSelector;
        var fields = fieldCount > 0 ? (React.createElement("div", { styleName: "data-pane-section" },
            React.createElement("h3", null, "Fields"),
            React.createElement(field_list_1.FieldList, null))) : null;
        var wildcardFields = fieldCount > 0 ? (React.createElement("div", { styleName: "data-pane-section" },
            React.createElement("h3", null, "Wildcard Fields"),
            React.createElement(field_list_1.PresetWildcardFieldList, null))) : null;
        return (React.createElement("div", { className: "pane", styleName: "data-pane" },
            React.createElement("h2", { styleName: "data-pane-title" }, "Data"),
            React.createElement("div", null,
                React.createElement("span", { styleName: "current-dataset" },
                    React.createElement("i", { className: "fa fa-database" }),
                    ' ',
                    name),
                React.createElement("span", { className: "right" }, showDataSourceSelector ? React.createElement(data_selector_1.DataSelector, { title: "Change" }) : null)),
            fields,
            wildcardFields));
    };
    return DataPanelBase;
}(React.PureComponent));
exports.DataPanelBase = DataPanelBase;
exports.DataPane = react_redux_1.connect(function (state) {
    return {
        data: _1.selectDataset(state),
        config: _1.selectConfig(state)
    };
})(CSSModules(DataPanelBase, styles));
