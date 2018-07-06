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
var index_1 = require("../models/index");
var index_2 = require("./index");
var tab_1 = require("./tab");
describe('selectors/tab', function () {
    var state = __assign({}, index_1.DEFAULT_STATE, { undoable: __assign({}, index_1.DEFAULT_UNDOABLE_STATE, { present: __assign({}, index_1.DEFAULT_UNDOABLE_STATE_BASE, { tab: __assign({}, index_1.DEFAULT_TAB, { activeTabID: 1, list: [index_1.DEFAULT_PLOT_TAB_STATE, __assign({}, index_1.DEFAULT_PLOT_TAB_STATE, { title: 'active tab' })] }) }) }) });
    describe('selectTab', function () {
        it('should select tab state', function () {
            expect(tab_1.selectTab(index_1.DEFAULT_STATE)).toBe(index_1.DEFAULT_TAB);
        });
    });
    describe('selectActiveTabID', function () {
        it('should select the active tab Id from state', function () {
            expect(tab_1.selectActiveTabID(state)).toBe(1);
        });
    });
    describe('selectActiveTab', function () {
        it('should select the active tab from the state', function () {
            expect(index_2.selectActiveTab(state)).toEqual(__assign({}, index_1.DEFAULT_PLOT_TAB_STATE, { title: 'active tab' }));
        });
    });
});
//# sourceMappingURL=tab.test.js.map