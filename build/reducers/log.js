"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("vega-lite/build/src/util");
var log_1 = require("../actions/log");
var spec_1 = require("../actions/shelf/spec");
var log_2 = require("../models/log");
function logReducer(log, action) {
    if (log === void 0) { log = log_2.DEFAULT_LOG; }
    if (spec_1.isSpecAction(action)) {
        return {
            errors: [],
            warnings: {
                warn: [],
                info: [],
                debug: []
            }
        };
    }
    switch (action.type) {
        case log_1.LOG_ERRORS_ADD:
            var errors = action.payload.errors;
            var newUniqueErrors = errors.filter(function (error) { return !util_1.contains(log.errors, error); });
            if (newUniqueErrors) {
                return __assign({}, log, { errors: log.errors.concat(newUniqueErrors) });
            }
            return log;
        case log_1.LOG_WARNINGS_ADD:
            var _a = action.payload, warnings = _a.warnings, level = _a.level;
            return logWarningsInLevel(log, warnings, level);
        case log_1.LOG_WARNINGS_CLEAR:
            return __assign({}, log, { warnings: {
                    warn: [],
                    info: [],
                    debug: []
                } });
        case log_1.LOG_ERRORS_CLEAR:
            return __assign({}, log, { errors: [] });
        default:
            return log;
    }
}
exports.logReducer = logReducer;
function logWarningsInLevel(log, warnings, level) {
    var preWarnings = log.warnings;
    var newUniqueWarnings = warnings.filter(function (warning) { return !util_1.contains(preWarnings[level], warning); });
    if (newUniqueWarnings) {
        return __assign({}, log, { warnings: __assign({}, preWarnings, (_a = {}, _a[level] = preWarnings[level].concat(newUniqueWarnings), _a)) });
    }
    return log;
    var _a;
}
//# sourceMappingURL=log.js.map