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
var redux_1 = require("redux");
var actions_1 = require("../actions");
var models_1 = require("../models");
var result_1 = require("./result");
var shelf_1 = require("./shelf");
var util_1 = require("./util");
var combinedPlotTabReducer = redux_1.combineReducers({
    title: titleReducer,
    shelf: shelf_1.shelfReducer,
    result: result_1.resultIndexReducer
});
function titleReducer(title, action) {
    if (title === void 0) { title = models_1.DEFAULT_TAB_TITLE; }
    switch (action.type) {
        case actions_1.TAB_TITLE_UPDATE:
            return action.payload.title;
    }
    return title;
}
exports.titleReducer = titleReducer;
function tabReducer(tab, action) {
    if (tab === void 0) { tab = models_1.DEFAULT_TAB; }
    var activeTabID = tab.activeTabID, list = tab.list;
    switch (action.type) {
        case actions_1.TAB_ADD:
            return __assign({}, tab, { activeTabID: list.length, list: list.concat([models_1.DEFAULT_PLOT_TAB_STATE]) });
        case actions_1.TAB_REMOVE:
            if (list.length === 1) {
                return tab;
            }
            var newActiveTabID = activeTabID < list.length - 1 ?
                activeTabID :
                activeTabID - 1; // except for last tab in the list, activate previous tab.
            return __assign({}, tab, { activeTabID: newActiveTabID, list: util_1.removeItemFromArray(list, activeTabID).array });
        case actions_1.TAB_SWITCH:
            if (activeTabID === action.payload.tabID) {
                return tab;
            }
            return __assign({}, tab, { activeTabID: action.payload.tabID });
    }
    return __assign({}, tab, { list: util_1.modifyItemInArray(tab.list, tab.activeTabID, function (plotTabState) { return combinedPlotTabReducer(plotTabState, action); }) });
}
exports.tabReducer = tabReducer;
//# sourceMappingURL=tab.js.map