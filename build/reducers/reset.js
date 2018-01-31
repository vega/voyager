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
var reset_1 = require("../actions/reset");
function makeResetReducer(r, resetIndex, defaultValue) {
    return function (state, action) {
        if (action.type === reset_1.RESET) {
            // Need to cast as object as TS somehow doesn't know that T extends object already
            var newState_1 = __assign({}, state);
            Object.keys(resetIndex).forEach(function (key) {
                newState_1[key] = defaultValue[key];
            });
            return newState_1;
        }
        else {
            return r(state, action);
        }
    };
}
exports.makeResetReducer = makeResetReducer;
//# sourceMappingURL=reset.js.map