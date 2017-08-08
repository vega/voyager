// Imports to satisfy --declarations build requirements
// https://github.com/Microsoft/TypeScript/issues/9944

// tslint:disable-next-line:no-unused-variable
import {StateWithHistory} from 'redux-undo';
import {State} from '../models';
import {Bookmark} from '../models/bookmark';
import {VoyagerConfig} from '../models/config';
import {ShelfPreview} from '../models/shelfpreview';
// import {PlotObject} from '../models/plot';
// tslint:disable-next-line:no-unused-variable

export * from './dataset';
export * from './result';
export * from './shelf';

export const selectBookmark = (state: State): Bookmark => state.persistent.bookmark;
export const selectConfig = (state: State): VoyagerConfig => state.undoable.present.config;
export const selectShelfPreview = (state: State): ShelfPreview => state.persistent.shelfPreview;
