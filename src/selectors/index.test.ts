import {DEFAULT_BOOKMARK} from '../models/bookmark';
import {DEFAULT_VOYAGER_CONFIG} from '../models/config';
import {DEFAULT_STATE} from '../models/index';
import {DEFAULT_LOG} from '../models/log';
import {DEFAULT_SHELF_PREVIEW} from '../models/shelf-preview';
import {selectBookmark, selectConfig, selectLog, selectShelfPreview} from './index';

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
});
