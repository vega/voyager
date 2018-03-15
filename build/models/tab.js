"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var result_1 = require("./result");
var shelf_1 = require("./shelf");
exports.DEFAULT_TAB_TITLE = 'untitled';
exports.DEFAULT_PLOT_TAB_STATE = {
    title: exports.DEFAULT_TAB_TITLE,
    shelf: shelf_1.DEFAULT_SHELF,
    result: result_1.DEFAULT_RESULT_INDEX
};
exports.DEFAULT_ACTIVE_TAB_ID = 0;
exports.DEFAULT_TAB = {
    activeTabID: exports.DEFAULT_ACTIVE_TAB_ID,
    list: [exports.DEFAULT_PLOT_TAB_STATE]
};
//# sourceMappingURL=tab.js.map