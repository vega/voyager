import {Mark} from 'vega-lite/build/src/mark';
import {Type} from 'vega-lite/build/src/type';
import {BOOKMARK_ADD_PLOT, BOOKMARK_CLEAR_ALL, BOOKMARK_MODIFY_NOTE, BOOKMARK_REMOVE_PLOT} from '../actions';
import {Bookmark, BookmarkItem, DEFAULT_BOOKMARK} from '../models';
import {ResultPlot} from '../models/result';
import {bookmarkReducer} from './bookmark';



describe('reducers/bookmark', () => {
  const data = {url: 'a/data/set.csv'};

  const plot: ResultPlot = {
    fieldInfos: [],
    spec: {
      data: data,
      mark: Mark.POINT,
      encoding: {
        x: {field: 'A', type: Type.QUANTITATIVE}
      }
    }
  };

  const specKey = JSON.stringify(plot.spec);

  describe(BOOKMARK_ADD_PLOT, () => {
    it('should add a plot to the bookmark list', () => {
      const expectedBookmarkItem: BookmarkItem = {plot: plot, note: ''};
      const expectedDict = {};
      expectedDict[specKey] = expectedBookmarkItem;

      expect(bookmarkReducer(
        {
          dict: {},
          count: 0,
          list: []
        },
        {
          type: BOOKMARK_ADD_PLOT,
          payload: {
            plot: plot
          }
        }
      )).toEqual({
        dict: expectedDict,
        count: 1,
        list: [specKey]
      } as Bookmark);
    });
  });

  describe(BOOKMARK_CLEAR_ALL, () => {
    it('should clear all bookmarks', () => {
      const bookmarkItem: BookmarkItem = {plot: plot, note: ''};
      expect(bookmarkReducer(
        {
          dict: {
            [specKey]: bookmarkItem
          },
          count: 1,
          list: [specKey]
        },
        {
          type: BOOKMARK_CLEAR_ALL
        }
      )).toEqual(DEFAULT_BOOKMARK);
    });
  });

  describe(BOOKMARK_MODIFY_NOTE, () => {
    it('should modify notes for a bookmarked plot', () => {
      const bookmarkItem: BookmarkItem = {plot: plot, note: ''};

      const expectedBookmarkItem: BookmarkItem = {plot: plot, note: 'This is very interesting.'};
      const expectedDict = {};
      expectedDict[specKey] = expectedBookmarkItem;

      expect(bookmarkReducer(
        {
          dict: {
            [specKey]: bookmarkItem
          },
          count: 1,
          list: [specKey]
        },
        {
          type: BOOKMARK_MODIFY_NOTE,
          payload: {
            note: 'This is very interesting.',
            spec: plot.spec
          }
        }
      )).toEqual({
        dict: expectedDict,
        count: 1,
        list: [specKey]
      } as Bookmark);
    });
  });

  describe(BOOKMARK_REMOVE_PLOT, () => {
    it('should remove a bookmark from the bookmark list', () => {
      const bookmarkItem: BookmarkItem = {plot: plot, note: ''};

      expect(bookmarkReducer(
        {
          dict: {
            [specKey]: bookmarkItem
          },
          count: 1,
          list: [specKey]
        },
        {
          type: BOOKMARK_REMOVE_PLOT,
          payload: {
            spec: plot.spec
          }
        }
      )).toEqual({
        dict: {},
        count: 0,
        list: []
      } as Bookmark);
    });
  });
});
