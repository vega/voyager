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
var styles = require("./data-pane.scss");
var actions_1 = require("../../actions");
var data_selector_1 = require("./data-selector");
var field_list_1 = require("./field-list");
var DataPanelBase = (function (_super) {
    __extends(DataPanelBase, _super);
    function DataPanelBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataPanelBase.prototype.render = function () {
        var name = this.props.data.name;
        var showDataSourceSelector = this.props.config.showDataSourceSelector;
        var dataName = (React.createElement("div", null,
            "Name: ",
            name));
        return (React.createElement("div", { className: "pane", styleName: "data-pane" },
            React.createElement("h2", null, "Data"),
            showDataSourceSelector ? React.createElement(data_selector_1.DataSelector, null) : dataName,
            React.createElement("div", { styleName: "data-pane-section" },
                React.createElement("h3", null, "Fields"),
                React.createElement(field_list_1.FieldList, null)),
            React.createElement("div", { styleName: "data-pane-section" },
                React.createElement("h3", null, "Wildcard Fields"),
                React.createElement(field_list_1.PresetWildcardFieldList, null))));
    };
    return DataPanelBase;
}(React.PureComponent));
exports.DataPanelBase = DataPanelBase;
exports.DataPane = react_redux_1.connect(function (state) {
    return {
        data: state.present.dataset,
        config: state.present.config
    };
}, actions_1.createDispatchHandler())(CSSModules(DataPanelBase, styles));
