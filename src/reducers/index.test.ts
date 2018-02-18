
import {ACTION_TYPES} from '../actions/index';
import {RESET} from '../actions/reset';
import {Bookmark, DEFAULT_BOOKMARK} from '../models/bookmark';
import {DEFAULT_CUSTOM_WILDCARD_FIELDS} from '../models/custom-wildcard-field';
import {DEFAULT_DATASET} from '../models/dataset';
import {
  DEFAULT_PERSISTENT_STATE,
  DEFAULT_PLOT_TAB_STATE,
  DEFAULT_STATE,
  DEFAULT_TAB,
  DEFAULT_UNDOABLE_STATE,
  DEFAULT_UNDOABLE_STATE_BASE,
  State
} from '../models/index';
import {DEFAULT_RELATED_VIEWS} from '../models/related-views';
import {DEFAULT_RESULT, DEFAULT_RESULT_INDEX} from '../models/result';
import {DEFAULT_SHELF, DEFAULT_SHELF_UNIT_SPEC} from '../models/shelf/index';
import {selectDataset} from '../selectors/dataset';
import {selectBookmark, selectCustomWildcardFields, selectRelatedViews, selectTab} from '../selectors/index';
import {selectResult} from '../selectors/result';
import {selectShelf, selectShelfAutoAddCount} from '../selectors/shelf';
import {ACTIONS_EXCLUDED_FROM_HISTORY, GROUPED_ACTIONS, rootReducer, USER_ACTIONS} from './index';

describe('reducers/index', () => {
  describe("Action Groups", () => {
    it('All actions should be in a group', () => {
      const actionsInIndex = [].concat(
        ACTIONS_EXCLUDED_FROM_HISTORY,
        GROUPED_ACTIONS,
        USER_ACTIONS
      );

      for (const action of ACTION_TYPES) {
        expect(actionsInIndex).toContain(action);
      }
    });
  });

  describe('RESET', () => {
    it('should reset bookmark, dataset, shelf, result, customWildcardFields, tab', () => {
      const oldState: State = {
        ...DEFAULT_STATE,
        persistent: {
          ...DEFAULT_PERSISTENT_STATE,
          bookmark: {count: 1, list: []} as Bookmark,
        },
        undoable: {
          ...DEFAULT_UNDOABLE_STATE,
          present: {
            ...DEFAULT_UNDOABLE_STATE_BASE,
            dataset: {
              isLoading: false,
              name: 'Mock',
              schema: null,
              data: null
            },
            customWildcardFields: [{fields: ['test']}],
            tab: {
              activeTabID: 1,
              list: [
                DEFAULT_PLOT_TAB_STATE,
                {
                  ...DEFAULT_PLOT_TAB_STATE,
                  shelf: {
                    ...DEFAULT_SHELF,
                    spec: {
                      mark: 'point',
                      ...DEFAULT_SHELF_UNIT_SPEC
                    },
                  },
                  result: {
                    ...DEFAULT_RESULT_INDEX,
                    main: {
                      isLoading: false,
                      plots: [], // mock
                      query: null,
                      limit: 20
                    }
                  }
                }
              ]
            }
          }
        }
      };
      const state = rootReducer(oldState, {type: RESET});

      expect(selectBookmark(state)).toEqual(DEFAULT_BOOKMARK);
      expect(selectCustomWildcardFields(state)).toEqual(DEFAULT_CUSTOM_WILDCARD_FIELDS);
      expect(selectDataset(state)).toEqual(DEFAULT_DATASET);
      expect(selectRelatedViews(state)).toEqual(DEFAULT_RELATED_VIEWS);
      expect(selectShelf(state)).toEqual(DEFAULT_SHELF);
      expect(selectShelfAutoAddCount(state)).toEqual(true);
      expect(selectResult.main(state)).toEqual(DEFAULT_RESULT);
      expect(selectTab(state)).toEqual(DEFAULT_TAB);
    });
  });
});

