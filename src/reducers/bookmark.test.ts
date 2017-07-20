import {Mark} from 'vega-lite/build/src/mark';
import {Type} from 'vega-lite/build/src/type';
import {BOOKMARK_ADD_PLOT, BOOKMARK_MODIFY_NOTE, BOOKMARK_REMOVE_PLOT} from '../actions';
import {Bookmark, BookmarkItem} from '../models';
import {PlotObject} from '../models/plot';
import {bookmarkReducer} from './bookmark';



describe('reducers/bookmark', () => {
  const data = {url: 'a/data/set.csv'};

  const plotObject: PlotObject = {
    fieldInfos: [],
    spec: {
      data: data,
      mark: Mark.POINT,
      encoding: {
        x: {field: 'A', type: Type.QUANTITATIVE}
      }
    }
  };

  const specKey = JSON.stringify(plotObject.spec);

  describe(BOOKMARK_ADD_PLOT, () => {
    it('should add a plot to the bookmark list', () => {
      const expectedBookmarkItem: BookmarkItem = {plot: plotObject, note: ''};
      const expectedDict = {};
      expectedDict[specKey] = expectedBookmarkItem;

      expect(bookmarkReducer(
        {
          dict: {},
          count: 0,
        },
        {
          type: BOOKMARK_ADD_PLOT,
          payload: {
            plot: plotObject
          }
        }
      )).toEqual({
        dict: expectedDict,
        count: 1,
      } as Bookmark);
    });
  });

  describe(BOOKMARK_MODIFY_NOTE, () => {
    it('should modify notes for a bookmarked plot', () => {
      const bookmarkItem: BookmarkItem = {plot: plotObject, note: ''};

      const originalDict: {[key: string]: BookmarkItem} = {};
      originalDict[specKey] = bookmarkItem;

      const expectedBookmarkItem: BookmarkItem = {plot: plotObject, note: 'This is very interesting.'};
      const expectedDict = {};
      expectedDict[specKey] = expectedBookmarkItem;

      expect(bookmarkReducer(
        {
          dict: originalDict,
          count: 1,
        },
        {
          type: BOOKMARK_MODIFY_NOTE,
          payload: {
            note: 'This is very interesting.',
            spec: plotObject.spec
          }
        }
      )).toEqual({
        dict: expectedDict,
        count: 1,
      } as Bookmark);
    });
  });

  describe(BOOKMARK_REMOVE_PLOT, () => {
    it('should remove a bookmark from the bookmark list', () => {
      const bookmarkItem: BookmarkItem = {plot: plotObject, note: ''};

      const originalDict: {[key: string]: BookmarkItem} = {};
      originalDict[specKey] = bookmarkItem;

      expect(bookmarkReducer(
        {
          dict: originalDict,
          count: 1,
        },
        {
          type: BOOKMARK_REMOVE_PLOT,
          payload: {
            spec: plotObject.spec
          }
        }
      )).toEqual({
        dict: {},
        count: 0,
      } as Bookmark);
    });
  });
});
