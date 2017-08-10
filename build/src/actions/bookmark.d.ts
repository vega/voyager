import { FacetedCompositeUnitSpec } from 'vega-lite/build/src/spec';
import { PlotObject } from '../models/plot';
import { ReduxAction } from './redux-action';
export declare type BookmarkAction = BookmarkAddPlot | BookmarkRemovePlot | BookmarkModifyNote;
export declare const BOOKMARK_ADD_PLOT = "BOOKMARK_ADD_PLOT";
export declare type BookmarkAddPlot = ReduxAction<typeof BOOKMARK_ADD_PLOT, {
    plotObject: PlotObject;
}>;
export declare const BOOKMARK_REMOVE_PLOT = "BOOKMARK_REMOVE_PLOT";
export declare type BookmarkRemovePlot = ReduxAction<typeof BOOKMARK_REMOVE_PLOT, {
    spec: FacetedCompositeUnitSpec;
}>;
export declare const BOOKMARK_MODIFY_NOTE = "BOOKMARK_MODIFY_NOTE";
export declare type BookmarkModifyNote = ReduxAction<typeof BOOKMARK_MODIFY_NOTE, {
    note: string;
    spec: FacetedCompositeUnitSpec;
}>;
