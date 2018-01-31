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
var log_1 = require("../actions/log");
var log_2 = require("../models/log");
var log_3 = require("./log");
describe('reducers/log', function () {
    var simpleLog = {
        warnings: {
            warn: ['warning 1', 'warning 2'],
            info: [],
            debug: []
        },
        errors: ['error 1', 'error 2']
    };
    describe(log_1.LOG_ERRORS_ADD, function () {
        it('should add an error to the existing log', function () {
            var errors = ['this is an error'];
            expect(log_3.logReducer(log_2.DEFAULT_LOG, {
                type: log_1.LOG_ERRORS_ADD,
                payload: {
                    errors: errors
                }
            })).toEqual(__assign({}, log_2.DEFAULT_LOG, { errors: errors }));
        });
        it('should not add duplicate errors', function () {
            var errors = ['error 1', 'error 1'];
            expect(log_3.logReducer(simpleLog, {
                type: log_1.LOG_ERRORS_ADD,
                payload: {
                    errors: errors
                }
            })).toEqual(__assign({}, simpleLog, { errors: ['error 1', 'error 2'] }));
        });
    });
    describe(log_1.LOG_WARNINGS_ADD, function () {
        it('should add warnings to the existing log', function () {
            var warnings = ['this is the first warning', 'this is the second warning'];
            expect(log_3.logReducer(log_2.DEFAULT_LOG, {
                type: log_1.LOG_WARNINGS_ADD,
                payload: {
                    warnings: warnings,
                    level: 'warn'
                }
            })).toEqual(__assign({}, log_2.DEFAULT_LOG, { warnings: {
                    warn: warnings,
                    info: [],
                    debug: []
                } }));
        });
        it('should not add duplicate warnings', function () {
            var warnings = ['warning 1', 'warning 3'];
            expect(log_3.logReducer(simpleLog, {
                type: log_1.LOG_WARNINGS_ADD,
                payload: {
                    warnings: warnings,
                    level: 'warn'
                }
            })).toEqual(__assign({}, simpleLog, { warnings: {
                    warn: ['warning 1', 'warning 2', 'warning 3'],
                    info: [],
                    debug: []
                } }));
        });
    });
    describe(log_1.LOG_WARNINGS_CLEAR, function () {
        it('should remove all warnings in the existing log', function () {
            expect(log_3.logReducer(simpleLog, {
                type: log_1.LOG_WARNINGS_CLEAR
            })).toEqual(__assign({}, simpleLog, { warnings: {
                    warn: [],
                    info: [],
                    debug: []
                } }));
        });
    });
    describe(log_1.LOG_ERRORS_CLEAR, function () {
        it('should remove error in the existing log', function () {
            expect(log_3.logReducer(simpleLog, {
                type: log_1.LOG_ERRORS_CLEAR
            })).toEqual(__assign({}, simpleLog, { errors: [] }));
        });
    });
});
//# sourceMappingURL=log.test.js.map