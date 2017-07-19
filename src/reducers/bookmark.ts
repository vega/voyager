import {Action, BOOKMARK_ADD_PLOT, BOOKMARK_MODIFY_NOTE, BOOKMARK_REMOVE_PLOT} from '../actions';
import {Bookmark, BookmarkItem} from '../models';


export function bookmarkReducer(bookmark: Bookmark, action: Action): Bookmark {
  const newBookmark = {
    dict: {
      ...bookmark.dict
    },
    numBookmarks: bookmark.numBookmarks
  };

  switch (action.type) {
    case BOOKMARK_ADD_PLOT: {
      const {plot} = action.payload;

      const specKey = JSON.stringify(plot.spec);
      if (!bookmark.dict[specKey]) {
        const bookmarkItem: BookmarkItem = {
          plot: plot,
          note: '',
        };

        newBookmark.numBookmarks++;
        newBookmark.dict[specKey] = bookmarkItem;
      }

      return newBookmark;
    }

    case BOOKMARK_MODIFY_NOTE: {
      const {note, spec} = action.payload;

      const specKey = JSON.stringify(spec);
      newBookmark.dict[specKey].note = note;
      return newBookmark;
    }

    case BOOKMARK_REMOVE_PLOT: {
      const {spec} = action.payload;

      newBookmark.numBookmarks--;
      const specKey = JSON.stringify(spec);
      delete newBookmark.dict[specKey];
      return newBookmark;
    }

    default: {
      return bookmark;
    }
  }
}
