import { ResultPlot } from '../models/result';
export interface BookmarkItem {
    plot: ResultPlot;
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
