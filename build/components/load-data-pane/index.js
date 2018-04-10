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
var index_1 = require("../../selectors/index");
var data_selector_1 = require("../data-selector");
var styles = require("./load-data-pane.scss");
var LoadDataBase = (function (_super) {
    __extends(LoadDataBase, _super);
    function LoadDataBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoadDataBase.prototype.render = function () {
        var showDataSourceSelector = this.props.config.showDataSourceSelector;
        if (showDataSourceSelector) {
            return (React.createElement("div", { className: "pane", styleName: "load-data-pane" },
                "Please load a dataset",
                ' ',
                React.createElement(data_selector_1.DataSelector, { title: "Load" })));
        }
        else {
            // TODO: Make this a config parameter of lib-voyager
            return (React.createElement("div", { className: "pane", styleName: "load-data-pane" }, "Please load a dataset.  (For the Electron app, please use the menu bar.)"));
        }
    };
    return LoadDataBase;
}(React.PureComponent));
exports.LoadDataBase = LoadDataBase;
exports.LoadData = react_redux_1.connect(function (state) {
    return {
        config: index_1.selectConfig(state)
    };
})(CSSModules(LoadDataBase, styles));
//# sourceMappingURL=index.js.map