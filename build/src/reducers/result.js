"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var actions_1 = require("../actions");
function mainResultReducer(state, action) {
    switch (action.type) {
        case actions_1.RESULT_REQUEST:
            return __assign({}, state, { isLoading: true, modelGroup: null });
        case actions_1.RESULT_RECEIVE:
            var modelGroup = action.payload.modelGroup;
            return __assign({}, state, { isLoading: false, modelGroup: modelGroup });
    }
    return state;
}
exports.mainResultReducer = mainResultReducer;
function resultReducer(state, action) {
    return {
        main: mainResultReducer(state.main, action)
    };
}
exports.resultReducer = resultReducer;
;
