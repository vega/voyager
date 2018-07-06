"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reselect_1 = require("reselect");
// tslint:enable:no-unused-variable
exports.selectTab = function (state) { return state.undoable.present.tab; };
exports.selectActiveTabID = reselect_1.createSelector(exports.selectTab, function (tab) { return tab.activeTabID; });
exports.selectActiveTab = reselect_1.createSelector(exports.selectTab, exports.selectActiveTabID, function (tab, activeTabID) { return tab.list[activeTabID]; });
//# sourceMappingURL=tab.js.map