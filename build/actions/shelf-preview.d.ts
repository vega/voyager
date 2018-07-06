import { Query } from 'compassql/build/src/query/query';
import { TopLevelFacetedUnitSpec } from 'vega-lite/build/src/spec';
import { PlainReduxAction, ReduxAction } from './redux-action';
export declare type ShelfPreviewAction = ShelfPreviewSpec | ShelfPreviewQuery | ShelfPreviewDisable;
export declare const SHELF_PREVIEW_SPEC = "SHELF_PREVIEW_SPEC";
export declare type ShelfPreviewSpec = ReduxAction<typeof SHELF_PREVIEW_SPEC, {
    spec: TopLevelFacetedUnitSpec;
}>;
export declare const SHELF_PREVIEW_QUERY = "SHELF_PREVIEW_QUERY";
export declare type ShelfPreviewQuery = ReduxAction<typeof SHELF_PREVIEW_QUERY, {
    query: Query;
}>;
export declare const SHELF_PREVIEW_DISABLE = "SHELF_PREVIEW_DISABLE";
export declare type ShelfPreviewDisable = PlainReduxAction<typeof SHELF_PREVIEW_DISABLE>;
