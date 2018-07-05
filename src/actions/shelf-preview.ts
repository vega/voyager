import {Query} from 'compassql/build/src/query/query';
import {TopLevelFacetedUnitSpec} from 'vega-lite/build/src/spec';
import {PlainReduxAction, ReduxAction} from './redux-action';

export type ShelfPreviewAction = ShelfPreviewSpec | ShelfPreviewQuery | ShelfPreviewDisable;

export const SHELF_PREVIEW_SPEC = 'SHELF_PREVIEW_SPEC';
export type ShelfPreviewSpec = ReduxAction<typeof SHELF_PREVIEW_SPEC, {
  spec: TopLevelFacetedUnitSpec
}>;

export const SHELF_PREVIEW_QUERY = 'SHELF_PREVIEW_QUERY';
export type ShelfPreviewQuery = ReduxAction<typeof SHELF_PREVIEW_QUERY, {
  query: Query
}>;

export const SHELF_PREVIEW_DISABLE = 'SHELF_PREVIEW_DISABLE';
export type ShelfPreviewDisable = PlainReduxAction<typeof SHELF_PREVIEW_DISABLE>;
