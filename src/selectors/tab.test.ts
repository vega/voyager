import { DEFAULT_SINGLE_VIEW_TAB_STATE, DEFAULT_STATE, DEFAULT_TABS,
  DEFAULT_UNDOABLE_STATE, DEFAULT_UNDOABLE_STATE_BASE, State} from '../models/index';
import { selectActiveTab } from './index';
import {selectActiveTabID, selectTabs} from './tab';

describe('selectors/tab', () => {
  const state: State = {
    ...DEFAULT_STATE,
    undoable: {
      ...DEFAULT_UNDOABLE_STATE,
      present: {
        ...DEFAULT_UNDOABLE_STATE_BASE,
        tabs: {
          ...DEFAULT_TABS,
          activeTabID: 1,
          list: [DEFAULT_SINGLE_VIEW_TAB_STATE,
            {
              ...DEFAULT_SINGLE_VIEW_TAB_STATE,
              title: 'active tab'
            }]
        }
      }
    }
  };

  describe('selectTabs', () => {
    it('should select tabs from the state', () => {
      expect(selectTabs(DEFAULT_STATE)).toBe(DEFAULT_TABS);
    });
  });

  describe('selectActiveTabID', () => {
    it('should select the active tab Id from state', () => {
      expect(selectActiveTabID(state)).toBe(1);
    });
  });

  describe('selectActiveTab', () => {
    it('should select the active tab from the state', () => {
      expect(selectActiveTab(state)).toEqual({
        ...DEFAULT_SINGLE_VIEW_TAB_STATE,
        title: 'active tab'
      });
    });
  });
});
