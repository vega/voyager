import {DEFAULT_QUERY_CONFIG} from 'compassql/build/src/config';
import {SpecQueryModel} from 'compassql/build/src/model';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {Schema} from 'compassql/build/src/schema';
import {Channel} from 'vega-lite/build/src/channel';
import {Mark} from 'vega-lite/build/src/mark';
import {BOOKMARK_ADD_PLOT, BOOKMARK_MODIFY_NOTE, BOOKMARK_REMOVE_PLOT} from '../actions';
import {Bookmark, BookmarkItem} from '../models';
import {convertToPlotObjectsGroup, extractPlotObjects, PlotObject} from '../models/plot';
import {bookmarkReducer} from './bookmark';



describe('reducers/bookmark', () => {
  const schema = new Schema({fields: []});
  function buildSpecQueryModel(specQ: SpecQuery) {
    return SpecQueryModel.build(specQ, schema, DEFAULT_QUERY_CONFIG);
  }

  function buildSpecQueryModelGroup(specQs: SpecQuery[]) {
    const items = specQs.map(specQ => buildSpecQueryModel(specQ));
    return {
      name: 'a name',
      path: 'path',
      items: items,
    };
  }

  const group = buildSpecQueryModelGroup([
    {
      mark: Mark.BAR,
      encodings: [
        {channel: Channel.X}
      ]
    }
  ]);

  const data = {url: 'a/data/set.csv'};
  const plotObjectGroup = convertToPlotObjectsGroup(group, data);
  const plotObject: PlotObject = extractPlotObjects(plotObjectGroup)[0];
  const specKey = JSON.stringify(plotObject.spec);


  describe(BOOKMARK_ADD_PLOT, () => {
    it('should add a plot to the bookmark list', () => {
      const expectedBookmarkItem: BookmarkItem = {plot: {...plotObject}, note: ''};
      const expectedDict = {};
      expectedDict[specKey] = expectedBookmarkItem;

      expect(bookmarkReducer(
        {
          dict: {},
          numBookmarks: 0,
        },
        {
          type: BOOKMARK_ADD_PLOT,
          payload: {
            plot: plotObject
          }
        }
      )).toEqual({
        dict: expectedDict,
        numBookmarks: 1,
      } as Bookmark);
    });
  });

  describe(BOOKMARK_MODIFY_NOTE, () => {
    it('should modify notes for a bookmarked plot', () => {
      const bookmarkItem: BookmarkItem = {plot: {...plotObject}, note: ''};

      const originalDict: {[key: string]: BookmarkItem} = {};
      originalDict[specKey] = bookmarkItem;

      const expectedBookmarkItem: BookmarkItem = {plot: plotObject, note: 'This is very interesting.'};
      const expectedDict = {};
      expectedDict[specKey] = expectedBookmarkItem;

      expect(bookmarkReducer(
        {
          dict: originalDict,
          numBookmarks: 1,
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
        numBookmarks: 1,
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
          numBookmarks: 1,
        },
        {
          type: BOOKMARK_REMOVE_PLOT,
          payload: {
            spec: plotObject.spec
          }
        }
      )).toEqual({
        dict: {},
        numBookmarks: 0,
      } as Bookmark);
    });
  });
});
