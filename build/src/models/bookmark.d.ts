import { PlotObject } from '../models/plot';
export interface BookmarkItem {
    plotObject: PlotObject;
    note: string;
}
export interface Bookmark {
    dict: {
        [key: string]: BookmarkItem;
    };
    count: number;
    list: string[];
}
export declare const DEFAULT_BOOKMARK: Bookmark;
