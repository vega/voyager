import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {PlainReduxAction, ReduxAction} from './redux-action';

export type ShelfPreviewAction = ShelfSpecPreview | ShelfSpecPreviewDisable;

export const SHELF_SPEC_PREVIEW = 'SHELF_SPEC_PREVIEW';
export type ShelfSpecPreview = ReduxAction<typeof SHELF_SPEC_PREVIEW, {
  spec: FacetedCompositeUnitSpec
}>;

export const SHELF_SPEC_PREVIEW_DISABLE = 'SHELF_SPEC_PREVIEW_DISABLE';
export type ShelfSpecPreviewDisable = PlainReduxAction<typeof SHELF_SPEC_PREVIEW_DISABLE>;
