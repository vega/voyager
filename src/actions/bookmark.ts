import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {ResultPlot} from '../models/result';
import {PlainReduxAction, ReduxAction} from './redux-action';

export type BookmarkAction = BookmarkAddPlot | BookmarkClearAll | BookmarkRemovePlot | BookmarkModifyNote;

export const BOOKMARK_ADD_PLOT = 'BOOKMARK_ADD_PLOT';
export type BookmarkAddPlot = ReduxAction<typeof BOOKMARK_ADD_PLOT, {
  plot: ResultPlot
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

export const BOOKMARK_CLEAR_ALL = 'BOOKMARK_CLEAR_ALL';
export type BookmarkClearAll = PlainReduxAction<typeof BOOKMARK_CLEAR_ALL>;
