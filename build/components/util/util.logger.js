"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("../../actions/log");
var Logger = (function () {
    function Logger(handleAction) {
        this.handleAction = handleAction;
    }
    Logger.prototype.level = function () {
        return this;
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.handleAction({
            type: log_1.LOG_ERRORS_ADD,
            payload: {
                errors: args
            }
        });
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.handleAction({
            type: log_1.LOG_WARNINGS_ADD,
            payload: {
                warnings: args,
                level: 'warn'
            }
        });
        return this;
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.handleAction({
            type: log_1.LOG_WARNINGS_ADD,
            payload: {
                warnings: args,
                level: 'info'
            }
        });
        return this;
    };
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.handleAction({
            type: log_1.LOG_WARNINGS_ADD,
            payload: {
                warnings: args,
                level: 'debug'
            }
        });
        return this;
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=util.logger.js.map