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
var actions_1 = require("../actions");
function configReducer(state, action) {
    switch (action.type) {
        case actions_1.SET_CONFIG:
            var config = action.payload.config;
            var res = __assign({}, state, config);
            return res;
    }
    return state;
}
exports.configReducer = configReducer;
