"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tab_1 = require("../actions/tab");
var models_1 = require("../models");
var tab_2 = require("./tab");
describe('reducers/tab', function () {
    describe('tabReducer', function () {
        describe(tab_1.TAB_ADD, function () {
            it('should add a new tab to the end of the list, and set activeTabID to the new tab', function () {
                var oldTab = {
                    activeTabID: 1,
                    list: [models_1.DEFAULT_PLOT_TAB_STATE,
                        models_1.DEFAULT_PLOT_TAB_STATE,
                        models_1.DEFAULT_PLOT_TAB_STATE]
                };
                var newTab = tab_2.tabReducer(oldTab, { type: tab_1.TAB_ADD });
                expect(newTab.activeTabID).toEqual(3);
                expect(newTab.list.length).toEqual(4);
            });
            it('should initialize the newly added tab with defaults', function () {
                var oldTab = {
                    activeTabID: 0,
                    list: [models_1.DEFAULT_PLOT_TAB_STATE]
                };
                var newTab = tab_2.tabReducer(oldTab, { type: tab_1.TAB_ADD });
                expect(newTab.list[newTab.list.length - 1]).toEqual(models_1.DEFAULT_PLOT_TAB_STATE);
            });
        });
        describe(tab_1.TAB_SWITCH, function () {
            it('should set activeTabID to tabID', function () {
                var oldTab = {
                    activeTabID: 2,
                    list: [models_1.DEFAULT_PLOT_TAB_STATE, models_1.DEFAULT_PLOT_TAB_STATE, models_1.DEFAULT_PLOT_TAB_STATE]
                };
                var newTab = tab_2.tabReducer(oldTab, { type: tab_1.TAB_SWITCH, payload: { tabID: 1 } });
                expect(newTab.activeTabID).toEqual(1);
            });
            it('should return the old state if the tab to switch to is already active', function () {
                var oldTab = {
                    activeTabID: 2,
                    list: [models_1.DEFAULT_PLOT_TAB_STATE, models_1.DEFAULT_PLOT_TAB_STATE, models_1.DEFAULT_PLOT_TAB_STATE]
                };
                var newTab = tab_2.tabReducer(oldTab, { type: tab_1.TAB_SWITCH, payload: { tabID: 2 } });
                expect(newTab).toBe(oldTab);
            });
        });
        describe(tab_1.TAB_REMOVE, function () {
            it('should not remove tab if tab list has only one tab', function () {
                var oldTab = {
                    activeTabID: 0,
                    list: [models_1.DEFAULT_PLOT_TAB_STATE]
                };
                var newTab = tab_2.tabReducer(oldTab, { type: tab_1.TAB_REMOVE });
                expect(newTab.list.length).toEqual(1);
                expect(newTab.activeTabID).toEqual(0);
            });
            it('should remove the active tab, and set the next tab active', function () {
                var oldTab = {
                    activeTabID: 1,
                    list: [models_1.DEFAULT_PLOT_TAB_STATE, models_1.DEFAULT_PLOT_TAB_STATE, models_1.DEFAULT_PLOT_TAB_STATE]
                };
                var newTab = tab_2.tabReducer(oldTab, { type: tab_1.TAB_REMOVE });
                expect(newTab.list.length).toEqual(2);
                expect(newTab.activeTabID).toEqual(1);
            });
            it('should set the last tab in the list active if no tab exists after the currently active tab', function () {
                var oldTab = {
                    activeTabID: 2,
                    list: [models_1.DEFAULT_PLOT_TAB_STATE, models_1.DEFAULT_PLOT_TAB_STATE, models_1.DEFAULT_PLOT_TAB_STATE]
                };
                var newTab = tab_2.tabReducer(oldTab, { type: tab_1.TAB_REMOVE });
                expect(newTab.list.length).toEqual(2);
                expect(newTab.activeTabID).toEqual(1);
            });
        });
    });
    describe('titleReducer', function () {
        describe(tab_1.TAB_TITLE_UPDATE, function () {
            it('should update the title of a tab', function () {
                var newTitle = tab_2.titleReducer('old title', { type: tab_1.TAB_TITLE_UPDATE, payload: { title: 'new title' } });
                expect(newTitle).toEqual('new title');
            });
        });
    });
});
//# sourceMappingURL=tab.test.js.map