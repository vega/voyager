import {PlotObject} from '../models/plot';

export interface BookmarkItem {
  plot: PlotObject;
  note: string;
}

export interface Bookmark {
  dict: {[key: string]: BookmarkItem};
  count: number;
  list: string[];
}

export const DEFAULT_BOOKMARK: Bookmark = {
  dict: {},
  count: 0,
  list: []
};
