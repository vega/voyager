import { FacetedCompositeUnitSpec } from 'vega-lite/build/src/spec';
import { ShelfFieldDef, ShelfFunction, ShelfId, ShelfMark } from '../models';
import { PlainReduxAction, ReduxAction } from './redux-action';
export declare type ShelfAction = ShelfClear | ShelfMarkChangeType | ShelfEncodingAction;
export declare type ShelfEncodingAction = ShelfFieldAdd | ShelfFieldAutoAdd | ShelfFieldRemove | ShelfFieldMove | ShelfFunctionChange | ShelfSpecLoad;
export declare const SHELF_CLEAR = "SHELF_CLEAR";
export declare type ShelfClear = PlainReduxAction<typeof SHELF_CLEAR>;
export declare const SHELF_MARK_CHANGE_TYPE = "SHELF_MARK_CHANGE_TYPE";
export declare type ShelfMarkChangeType = ReduxAction<typeof SHELF_MARK_CHANGE_TYPE, ShelfMark>;
export declare const SHELF_FIELD_ADD = "SHELF_FIELD_ADD";
export declare type ShelfFieldAdd = ReduxAction<typeof SHELF_FIELD_ADD, {
    shelfId: ShelfId;
    fieldDef: ShelfFieldDef;
    replace: boolean;
}>;
export declare const SHELF_FIELD_AUTO_ADD = "SHELF_FIELD_AUTO_ADD";
export declare type ShelfFieldAutoAdd = ReduxAction<typeof SHELF_FIELD_AUTO_ADD, {
    fieldDef: ShelfFieldDef;
}>;
export declare const SHELF_FIELD_REMOVE = "SHELF_FIELD_REMOVE";
export declare type ShelfFieldRemove = ReduxAction<typeof SHELF_FIELD_REMOVE, ShelfId>;
export declare const SHELF_FIELD_MOVE = "SHELF_FIELD_MOVE";
export declare type ShelfFieldMove = ReduxAction<typeof SHELF_FIELD_MOVE, {
    from: ShelfId;
    to: ShelfId;
}>;
/**
 * Change Function of a FieldDef to a specific value.
 */
export declare const SHELF_FUNCTION_CHANGE = "SHELF_FUNCTION_CHANGE";
export declare type ShelfFunctionChange = ReduxAction<typeof SHELF_FUNCTION_CHANGE, {
    shelfId: ShelfId;
    fn: ShelfFunction;
}>;
export declare const SHELF_SPEC_LOAD = "SHELF_SPEC_LOAD";
export declare type ShelfSpecLoad = ReduxAction<typeof SHELF_SPEC_LOAD, {
    spec: FacetedCompositeUnitSpec;
    keepWildcardMark: boolean;
}>;
export declare const SHELF_SPEC_PREVIEW = "SHELF_SPEC_PREVIEW";
export declare type ShelfSpecPreview = ReduxAction<typeof SHELF_SPEC_PREVIEW, {
    spec: FacetedCompositeUnitSpec;
}>;
export declare const SHELF_SPEC_PREVIEW_DISABLE = "SHELF_SPEC_PREVIEW_DISABLE";
export declare type ShelfSpecPreviewDisable = PlainReduxAction<typeof SHELF_SPEC_PREVIEW_DISABLE>;
