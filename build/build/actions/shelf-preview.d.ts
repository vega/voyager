import { FacetedCompositeUnitSpec } from 'vega-lite/build/src/spec';
import { PlainReduxAction, ReduxAction } from './redux-action';
export declare type ShelfPreviewAction = ShelfPreviewSpec | ShelfPreviewSpecDisable;
export declare const SHELF_PREVIEW_SPEC = "SHELF_PREVIEW_SPEC";
export declare type ShelfPreviewSpec = ReduxAction<typeof SHELF_PREVIEW_SPEC, {
    spec: FacetedCompositeUnitSpec;
}>;
export declare const SHELF_PREVIEW_SPEC_DISABLE = "SHELF_PREVIEW_SPEC_DISABLE";
export declare type ShelfPreviewSpecDisable = PlainReduxAction<typeof SHELF_PREVIEW_SPEC_DISABLE>;
