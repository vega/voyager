import { DEFAULT_PLOT_TAB_STATE, DEFAULT_STATE, DEFAULT_TAB,
  DEFAULT_UNDOABLE_STATE, DEFAULT_UNDOABLE_STATE_BASE, State} from '../models/index';
import { selectActiveTab } from './index';
import {selectActiveTabID, selectTab} from './tab';

describe('selectors/tab', () => {
  const state: State = {
    ...DEFAULT_STATE,
    undoable: {
      ...DEFAULT_UNDOABLE_STATE,
      present: {
        ...DEFAULT_UNDOABLE_STATE_BASE,
        tab: {
          ...DEFAULT_TAB,
          activeTabID: 1,
          list: [DEFAULT_PLOT_TAB_STATE,
            {
              ...DEFAULT_PLOT_TAB_STATE,
              title: 'active tab'
            }]
        }
      }
    }
  };

  describe('selectTab', () => {
    it('should select tab state', () => {
      expect(selectTab(DEFAULT_STATE)).toBe(DEFAULT_TAB);
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
        ...DEFAULT_PLOT_TAB_STATE,
        title: 'active tab'
      });
    });
  });
});
