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
var config_1 = require("../models/config");
function configReducer(state, action) {
    if (state === void 0) { state = config_1.DEFAULT_VOYAGER_CONFIG; }
    switch (action.type) {
        case actions_1.SET_CONFIG:
            var config = action.payload.config;
            var res = __assign({}, state, config);
            return res;
    }
    return state;
}
exports.configReducer = configReducer;
//# sourceMappingURL=config.js.map