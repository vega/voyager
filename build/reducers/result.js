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
    if (state === void 0) { state = models_1.DEFAULT_RESULT; }
    switch (action.type) {
        case actions_1.RESULT_REQUEST:
            return __assign({}, state, { isLoading: true, modelGroup: undefined, query: undefined });
        case actions_1.RESULT_RECEIVE:
            var _a = action.payload, modelGroup = _a.modelGroup, query = _a.query;
            return __assign({}, state, { isLoading: false, modelGroup: modelGroup,
                query: query });
    }
    return state;
}
exports.resultReducer = resultReducer;
function resultIndexReducer(state, action) {
    if (state === void 0) { state = models_1.DEFAULT_RESULT_INDEX; }
    switch (action.type) {
        case actions_1.RESULT_REQUEST:
        case actions_1.RESULT_RECEIVE:
            var resultType = action.payload.resultType;
            return __assign({}, (action.type === actions_1.RESULT_REQUEST && resultType === 'main' ?
                // When making a main query result request, reset all other results
                // as the older related views results will be outdated anyway.
                models_1.DEFAULT_RESULT_INDEX :
                state), (_a = {}, _a[resultType] = resultReducer(state[resultType], action), _a));
    }
    return state;
    var _a;
}
exports.resultIndexReducer = resultIndexReducer;
