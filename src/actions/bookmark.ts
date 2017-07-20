import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {PlotObject} from '../models/plot';
import {ReduxAction} from './redux-action';

export type BookmarkAction = BookmarkAddPlot | BookmarkRemovePlot | BookmarkModifyNote;

export const BOOKMARK_ADD_PLOT = 'BOOKMARK_ADD_PLOT';
export type BookmarkAddPlot = ReduxAction<typeof BOOKMARK_ADD_PLOT, {
  plotObject: PlotObject
}>;

export const BOOKMARK_REMOVE_PLOT = 'BOOKMARK_REMOVE_PLOT';
export type BookmarkRemovePlot = ReduxAction<typeof BOOKMARK_REMOVE_PLOT, {
  spec: FacetedCompositeUnitSpec
}>;

export const BOOKMARK_MODIFY_NOTE = 'BOOKMARK_MODIFY_NOTE';
export type BookmarkModifyNote = ReduxAction<typeof BOOKMARK_MODIFY_NOTE, {
  note: string,
  spec: FacetedCompositeUnitSpec
}>;
