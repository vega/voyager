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
var idlLogo = require("../../../images/idl-h56.png");
var logo = require("../../../images/logo.png");
var dataset_1 = require("../../selectors/dataset");
var controls_1 = require("./controls");
var styles = require("./header.scss");
var HeaderBase = (function (_super) {
    __extends(HeaderBase, _super);
    function HeaderBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HeaderBase.prototype.render = function () {
        var data = this.props.data;
        return (React.createElement("div", { styleName: 'header' },
            React.createElement("img", { styleName: 'voyager-logo', src: logo }),
            data && React.createElement(controls_1.Controls, null),
            React.createElement("a", { styleName: 'idl-logo', onClick: this.openLink },
                React.createElement("img", { src: idlLogo }))));
    };
    HeaderBase.prototype.openLink = function () {
        window.open('https://idl.cs.washington.edu/');
    };
    return HeaderBase;
}(React.PureComponent));
exports.HeaderBase = HeaderBase;
exports.Header = react_redux_1.connect(function (state) {
    return {
        data: dataset_1.selectData(state)
    };
})(CSSModules(HeaderBase, styles));
//# sourceMappingURL=index.js.map