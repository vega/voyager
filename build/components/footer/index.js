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
var Papa = require("papaparse");
var React = require("react");
var CSSModules = require("react-css-modules");
var fileDownload = require("react-file-download");
var export_logs_1 = require("../../models/export-logs");
var index_1 = require("../../store/index");
var styles = require("./footer.scss");
var FooterBase = (function (_super) {
    __extends(FooterBase, _super);
    function FooterBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FooterBase.prototype.render = function () {
        return (React.createElement("div", { styleName: 'footer' },
            React.createElement("a", { onClick: this.exportLogs }, "Download logs")));
    };
    FooterBase.prototype.exportLogs = function () {
        var logs = export_logs_1.constructLogString(index_1.actionLogs.getLog().actions);
        var csv = Papa.unparse(logs);
        var fileName = "Logs_voyager_" + new Date() + ".csv";
        fileDownload(csv, fileName);
    };
    return FooterBase;
}(React.PureComponent));
exports.FooterBase = FooterBase;
exports.Footer = CSSModules(FooterBase, styles);
//# sourceMappingURL=index.js.map