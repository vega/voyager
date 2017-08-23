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
var react_dnd_1 = require("react-dnd");
var react_dnd_html5_backend_1 = require("react-dnd-html5-backend");
var react_redux_1 = require("react-redux");
var SplitPane = require("react-split-pane");
var dataset_1 = require("../../selectors/dataset");
require("../app.scss");
var index_1 = require("../data-pane/index");
var index_2 = require("../encoding-pane/index");
var index_3 = require("../footer/index");
var index_4 = require("../header/index");
var index_5 = require("../load-data-pane/index");
var index_6 = require("../view-pane/index");
var AppRootBase = (function (_super) {
    __extends(AppRootBase, _super);
    function AppRootBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AppRootBase.prototype.render = function () {
        var bottomPane, footer;
        if (!this.props.data) {
            bottomPane = React.createElement(index_5.LoadData, null);
        }
        else {
            bottomPane = (React.createElement(SplitPane, { split: "vertical", defaultSize: 200 },
                React.createElement(index_1.DataPane, null),
                React.createElement(SplitPane, { split: "vertical", defaultSize: 235 },
                    React.createElement(index_2.EncodingPane, null),
                    React.createElement(index_6.ViewPane, null))));
            footer = React.createElement(index_3.Footer, null);
        }
        return (React.createElement("div", { className: "voyager" },
            React.createElement(index_4.Header, null),
            bottomPane,
            footer));
    };
    return AppRootBase;
}(React.PureComponent));
exports.AppRoot = react_redux_1.connect(function (state) {
    return {
        data: dataset_1.selectData(state)
    };
})(react_dnd_1.DragDropContext(react_dnd_html5_backend_1.default)(AppRootBase));
//# sourceMappingURL=index.js.map