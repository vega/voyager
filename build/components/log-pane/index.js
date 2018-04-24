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
var log_1 = require("../../actions/log");
var redux_action_1 = require("../../actions/redux-action");
var index_1 = require("../../selectors/index");
var styles = require("./log-pane.scss");
var LogPaneBase = (function (_super) {
    __extends(LogPaneBase, _super);
    function LogPaneBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LogPaneBase.prototype.render = function () {
        var warnings = this.props.log.warnings;
        var errors = this.props.log.errors;
        var warningPane = warnings.warn.length > 0 || warnings.debug.length > 0 || warnings.info.length > 0 ? (React.createElement("div", { styleName: 'warning-pane' },
            React.createElement("a", { styleName: 'close', onClick: this.closeWarnings.bind(this) }, "x"),
            React.createElement("ul", null,
                this.returnLevelWarnings(warnings, 'warn'),
                this.returnLevelWarnings(warnings, 'info'),
                this.returnLevelWarnings(warnings, 'debug')))) : null;
        var errorPane = errors.length > 0 ? (React.createElement("div", { styleName: 'error-pane' },
            React.createElement("a", { styleName: 'close', onClick: this.closeErrors.bind(this) }, "x"),
            React.createElement("ul", null, errors.map(function (error, index) {
                return (React.createElement("li", { key: index }, error));
            })))) : null;
        return (React.createElement("div", null,
            warningPane,
            errorPane));
    };
    LogPaneBase.prototype.closeWarnings = function () {
        this.props.handleAction({
            type: log_1.LOG_WARNINGS_CLEAR
        });
    };
    LogPaneBase.prototype.closeErrors = function () {
        this.props.handleAction({
            type: log_1.LOG_ERRORS_CLEAR,
        });
    };
    LogPaneBase.prototype.returnLevelWarnings = function (warnings, level) {
        return warnings[level].map(function (warning, index) {
            return (React.createElement("li", { key: index },
                "[",
                level.toUpperCase(),
                "] ",
                warning));
        });
    };
    return LogPaneBase;
}(React.PureComponent));
exports.LogPaneBase = LogPaneBase;
exports.LogPane = react_redux_1.connect(function (state) {
    return {
        log: index_1.selectLog(state)
    };
}, redux_action_1.createDispatchHandler())(CSSModules(LogPaneBase, styles));
//# sourceMappingURL=index.js.map