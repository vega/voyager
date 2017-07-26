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
var models_1 = require("../models");
function resultReducer(state, action) {
    if (state === void 0) { state = models_1.DEFAULT_RESULT_MAIN; }
    switch (action.type) {
        case actions_1.RESULT_REQUEST:
            return __assign({}, state, { isLoading: true, modelGroup: null });
        case actions_1.RESULT_RECEIVE:
            var modelGroup = action.payload.modelGroup;
            return __assign({}, state, { isLoading: false, modelGroup: modelGroup });
    }
    return state;
}
exports.resultReducer = resultReducer;
function resultIndexReducer(state, action) {
    if (state === void 0) { state = models_1.DEFAULT_RESULT; }
    switch (action.type) {
        case actions_1.RESULT_REQUEST:
        case actions_1.RESULT_RECEIVE:
            var resultType = action.payload.resultType;
            return __assign({}, state, (_a = {}, _a[resultType] = resultReducer(state[resultType], action), _a));
    }
    var _a;
}
exports.resultIndexReducer = resultIndexReducer;
