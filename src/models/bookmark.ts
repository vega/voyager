import {PlotObject} from '../models/plot';

export interface BookmarkItem {
  plot: PlotObject;
  note: string;
}

export interface Bookmark {
  dict: {[key: string]: BookmarkItem};
  numBookmarks: number;
}

export const DEFAULT_BOOKMARK: Bookmark = {
  dict: {},
  numBookmarks: 0,
};
