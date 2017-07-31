import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {PlainReduxAction, ReduxAction} from './redux-action';

export type ShelfPreviewAction = ShelfPreviewSpec | ShelfPreviewSpecDisable;

export const SHELF_PREVIEW_SPEC = 'SHELF_PREVIEW_SPEC';
export type ShelfPreviewSpec = ReduxAction<typeof SHELF_PREVIEW_SPEC, {
  spec: FacetedCompositeUnitSpec
}>;

export const SHELF_PREVIEW_SPEC_DISABLE = 'SHELF_PREVIEW_SPEC_DISABLE';
export type ShelfPreviewSpecDisable = PlainReduxAction<typeof SHELF_PREVIEW_SPEC_DISABLE>;
