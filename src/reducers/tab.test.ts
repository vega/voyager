import {TAB_ADD, TAB_REMOVE, TAB_SWITCH, TAB_TITLE_UPDATE} from '../actions/tab';
import {DEFAULT_PLOT_TAB_STATE, Tab} from '../models';
import {tabReducer, titleReducer} from './tab';

describe('reducers/tab', () => {
  describe('tabReducer', () => {
    describe(TAB_ADD, () => {
      it('should add a new tab to the end of the list, and set activeTabID to the new tab', () => {
        const oldTab: Tab = {
          activeTabID: 1,
          list: [DEFAULT_PLOT_TAB_STATE,
            DEFAULT_PLOT_TAB_STATE,
            DEFAULT_PLOT_TAB_STATE]
        };
        const newTab: Tab = tabReducer(oldTab, {type: TAB_ADD});
        expect(newTab.activeTabID).toEqual(3);
        expect(newTab.list.length).toEqual(4);
      });

      it('should initialize the newly added tab with defaults', () => {
        const oldTab: Tab = {
          activeTabID: 0,
          list: [DEFAULT_PLOT_TAB_STATE]
        };
        const newTab: Tab = tabReducer(oldTab, {type: TAB_ADD});
        expect(newTab.list[newTab.list.length - 1]).toEqual(DEFAULT_PLOT_TAB_STATE);
      });
    });

    describe(TAB_SWITCH, () => {
      it('should set activeTabID to tabID', () => {
        const oldTab: Tab = {
          activeTabID: 2,
          list: [DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE]
        };
        const newTab: Tab = tabReducer(oldTab, {type: TAB_SWITCH, payload: {tabID: 1}});
        expect(newTab.activeTabID).toEqual(1);
      });

      it('should return the old state if the tab to switch to is already active', () => {
        const oldTab: Tab = {
          activeTabID: 2,
          list: [DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE]
        };
        const newTab: Tab = tabReducer(oldTab, {type: TAB_SWITCH, payload: {tabID: 2}});
        expect(newTab).toBe(oldTab);
      });
    });

    describe(TAB_REMOVE, () => {
      it('should not remove tab if tab list has only one tab', () => {
        const oldTab = {
          activeTabID: 0,
          list: [DEFAULT_PLOT_TAB_STATE]
        };
        const newTab: Tab = tabReducer(oldTab, {type: TAB_REMOVE});
        expect(newTab.list.length).toEqual(1);
        expect(newTab.activeTabID).toEqual(0);
      });

      it('should remove the active tab, and set the next tab active', () => {
        const oldTab = {
          activeTabID: 1,
          list: [DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE]
        };
        const newTab: Tab = tabReducer(oldTab, {type: TAB_REMOVE});
        expect(newTab.list.length).toEqual(2);
        expect(newTab.activeTabID).toEqual(1);
      });

      it('should set the last tab in the list active if no tab exists after the currently active tab', () => {
        const oldTab = {
          activeTabID: 2,
          list: [DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE, DEFAULT_PLOT_TAB_STATE]
        };
        const newTab: Tab = tabReducer(oldTab, {type: TAB_REMOVE});
        expect(newTab.list.length).toEqual(2);
        expect(newTab.activeTabID).toEqual(1);
      });
    });
  });

  describe('titleReducer', () => {
    describe(TAB_TITLE_UPDATE, () => {
      it('should update the title of a tab', () => {
        const newTitle: string = titleReducer('old title', {type: TAB_TITLE_UPDATE, payload: {title: 'new title'}});
        expect(newTitle).toEqual('new title');
      });
    });
  });
});
