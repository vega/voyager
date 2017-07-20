import {Action, BOOKMARK_ADD_PLOT, BOOKMARK_MODIFY_NOTE, BOOKMARK_REMOVE_PLOT} from '../actions';
import {Bookmark, BookmarkItem} from '../models';


export function bookmarkReducer(bookmark: Bookmark, action: Action): Bookmark {
  const {count, dict, list} = bookmark;


  switch (action.type) {
    case BOOKMARK_ADD_PLOT: {
      const {plot} = action.payload;
      const bookmarkItem: BookmarkItem = {
        plot: plot,
        note: '',
      };

      const specKey = JSON.stringify(plot.spec);

      return {
        dict: {
          ...dict,
          [specKey]: bookmarkItem
        },
        count: count + 1,
        list: list.concat([specKey])
      };
    }

    case BOOKMARK_MODIFY_NOTE: {
      const {note, spec} = action.payload;

      const specKey = JSON.stringify(spec);
      const modifiedBookmarkItem: BookmarkItem = {
        ...dict[specKey],
        note: note
      };

      return {
        dict: {
          ...dict,
          [specKey]: modifiedBookmarkItem
        },
        count: count,
        list: list.slice()
      };
    }

    case BOOKMARK_REMOVE_PLOT: {
      const {spec} = action.payload;

      const specKey = JSON.stringify(spec);
      const newBookmark = {
        dict: {
          ...dict
        },
        count: count - 1,
        list: list.filter(item => item !== specKey)
      };

      delete newBookmark.dict[specKey];
      return newBookmark;
    }

    default: {
      return bookmark;
    }
  }
}
