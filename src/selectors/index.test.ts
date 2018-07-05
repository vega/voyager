import {isArray} from 'vega-util';
import {DEFAULT_BOOKMARK} from '../models/bookmark';
import {DEFAULT_VOYAGER_CONFIG} from '../models/config';
import {DEFAULT_CUSTOM_WILDCARD_FIELDS} from '../models/custom-wildcard-field';
import {DEFAULT_DATASET} from '../models/dataset';
import {DEFAULT_ACTIVE_TAB_ID, DEFAULT_PLOT_TAB_STATE, DEFAULT_STATE, State} from '../models/index';
import {DEFAULT_LOG} from '../models/log';
import {DEFAULT_SHELF_PREVIEW} from '../models/shelf-preview';
import {DEFAULT_SHELF} from '../models/shelf/index';
import {selectBookmark, selectConfig, selectFilteredData, selectLog, selectShelfPreview} from './index';

describe('selectors/index', () => {
  describe('selectBookmark', () => {
    it('selecting bookmark returns default bookmark', () => {
      expect(selectBookmark(DEFAULT_STATE)).toBe(DEFAULT_BOOKMARK);
    });
  });

  describe('selectConfig', () => {
    it('selecting config should returns default voyager config', () => {
      expect(selectConfig(DEFAULT_STATE)).toBe(DEFAULT_VOYAGER_CONFIG);
    });
  });

  describe('selectShelfPreview', () => {
    it('selecting shelf preview should return default shelf preview', () => {
      expect(selectShelfPreview(DEFAULT_STATE)).toBe(DEFAULT_SHELF_PREVIEW);
    });
  });

  describe('selectLog', () => {
    it('selecting log from the default state should return the default log', () => {
      expect(selectLog(DEFAULT_STATE)).toBe(DEFAULT_LOG);
    });
  });

  describe('selectFilteredData', () => {
    it('returns filtered data', () => {
      const state: State = {
        ...DEFAULT_STATE,
        undoable: {
          ...DEFAULT_STATE.undoable,
          present: {
            ...DEFAULT_STATE.undoable.present,
            dataset: {
              ...DEFAULT_DATASET,
              data: {
                values: [{a: 1}, {a: 3}]
              }
            },
            customWildcardFields: DEFAULT_CUSTOM_WILDCARD_FIELDS,
            tab: {
              activeTabID: DEFAULT_ACTIVE_TAB_ID,
              list: [{
                ...DEFAULT_PLOT_TAB_STATE,
                shelf: {
                  ...DEFAULT_SHELF,
                  filters: [{field: 'a', oneOf: [3]}]
                }
              }]
            }
          },
        }
      };
      const filteredData = selectFilteredData(state);
      if (isArray(filteredData.values)) {
        expect(filteredData.values.length).toEqual(1);
      }
      expect(filteredData.values[0].a).toEqual(3);
    });
  });

  describe('selectFilteredData', () => {
    it('returns original data if there is no filter.', () => {
      const data = {values: [{a: 1}, {a: 3}]};
      const state: State = {
        ...DEFAULT_STATE,
        undoable: {
          ...DEFAULT_STATE.undoable,
          present: {
            ...DEFAULT_STATE.undoable.present,
            dataset: {
              ...DEFAULT_DATASET,
              data
            }
          },
        }
      };

      expect(selectFilteredData(state)).toBe(data);
    });
  });
  describe('selectFilteredData', () => {
    it('returns null data if there is no data.', () => {
      expect(selectFilteredData(DEFAULT_STATE)).toBe(DEFAULT_DATASET.data);
    });
  });
});
