import {TAB_ADD, TAB_REMOVE, TAB_SWITCH, TITLE_UPDATE} from '../actions/tab';
import {DEFAULT_PLOT_TAB_STATE, Tabs} from '../models';
import {tabsReducer, titleReducer} from './tab';

describe('reducers/tabs', () => {
  describe('tabsReducer', () => {
    describe(TAB_ADD, () => {
      it('should add a new tab to the end of the list, and set activeTabID to the new tab', () => {
        const oldTabs: Tabs = {
          activeTabID: 1,
          list: [DEFAULT_PLOT_TAB_STATE,
            DEFAULT_PLOT_TAB_STATE,
            DEFAULT_PLOT_TAB_STATE]
        };
        const newTabs: Tabs = tabsReducer(oldTabs, {type: TAB_ADD});
        expect(newTabs.activeTabID).toEqual(3);
        expect(newTabs.list.length).toEqual(4);
      });

      it('should initialize the newly added tab with defaults', () => {
        const oldTabs: Tabs = {
          activeTabID: 0,
          list: [DEFAULT_PLOT_TAB_STATE]
        };
        const newTabs: Tabs = tabsReducer(oldTabs, {type: TAB_ADD});
        expect(newTabs.list[newTabs.list.length - 1]).toEqual(DEFAULT_PLOT_TAB_STATE);
      });
    });

    describe(TAB_SWITCH, () => {
      it('should set activeTabID to tabID', () => {
        const oldTabs: Tabs = {
          activeTabID: 2,
          list: [DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE]
        };
        const newTabs: Tabs = tabsReducer(oldTabs, {type: TAB_SWITCH, payload: {tabID: 1}});
        expect(newTabs.activeTabID).toEqual(1);
      });

      it('should return the old state if the tab to switch to is already active', () => {
        const oldTabs: Tabs = {
          activeTabID: 2,
          list: [DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE]
        };
        const newTabs: Tabs = tabsReducer(oldTabs, {type: TAB_SWITCH, payload: {tabID: 2}});
        expect(newTabs).toBe(oldTabs);
      });
    });

    describe(TAB_REMOVE, () => {
      it('should not remove tab if tab list has only one tab', () => {
        const oldTabs = {
          activeTabID: 0,
          list: [DEFAULT_PLOT_TAB_STATE]
        };
        const newTabs: Tabs = tabsReducer(oldTabs, {type: TAB_REMOVE});
        expect(newTabs.list.length).toEqual(1);
        expect(newTabs.activeTabID).toEqual(0);
      });

      it('should remove the active tab, and set the next tab active', () => {
        const oldTabs = {
          activeTabID: 1,
          list: [DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE]
        };
        const newTabs: Tabs = tabsReducer(oldTabs, {type: TAB_REMOVE});
        expect(newTabs.list.length).toEqual(2);
        expect(newTabs.activeTabID).toEqual(1);
      });

      it('should set the last tab in the list active if no tab exists after the currently active tab', () => {
        const oldTabs = {
          activeTabID: 2,
          list: [DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE]
        };
        const newTabs: Tabs = tabsReducer(oldTabs, {type: TAB_REMOVE});
        expect(newTabs.list.length).toEqual(2);
        expect(newTabs.activeTabID).toEqual(1);
      });
    });
  });

  describe('titleReducer', () => {
    describe(TITLE_UPDATE, () => {
      it('should update the title of a tab', () => {
        const newTitle: string = titleReducer('old title', {type: TITLE_UPDATE, payload: {newTitle: 'new title'}});
        expect(newTitle).toEqual('new title');
      });
    });
  });
});
