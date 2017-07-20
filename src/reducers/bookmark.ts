import {Action, BOOKMARK_ADD_PLOT, BOOKMARK_MODIFY_NOTE, BOOKMARK_REMOVE_PLOT} from '../actions';
import {Bookmark, BookmarkItem} from '../models';


export function bookmarkReducer(bookmark: Bookmark, action: Action): Bookmark {
  const {count, dict} = bookmark;


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
        count: count + 1
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
        count: count
      };
    }

    case BOOKMARK_REMOVE_PLOT: {
      const {spec} = action.payload;

      const specKey = JSON.stringify(spec);
      const newBookmark = {
        dict: {
          ...dict
        },
        count: count - 1
      };

      delete newBookmark.dict[specKey];
      return newBookmark;
    }

    default: {
      return bookmark;
    }
  }
}
