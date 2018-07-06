import { TopLevelFacetedUnitSpec } from 'vega-lite/build/src/spec';
import { ShelfFieldDef, ShelfFunction, ShelfId, ShelfMark } from '../../models';
import { ShelfValueDef } from '../../models/shelf/spec';
import { Action } from '../index';
import { PlainReduxAction, ReduxAction } from '../redux-action';
export declare type SpecAction = SpecClear | SpecMarkChangeType | SpecEncodingAction;
export declare type SpecEncodingAction = SpecFieldAdd | SpecFieldAutoAdd | SpecFieldRemove | SpecFieldMove | SpecFieldPropChange<any> | SpecFieldNestedPropChange<any, any> | SpecFunctionChange | SpecFunctionAddWildcard | SpecFunctionRemoveWildcard | SpecFunctionDisableWildcard | SpecFunctionEnableWildcard | SpecLoad | SpecValueChange;
export declare const SPEC_CLEAR = "SPEC_CLEAR";
export declare type SpecClear = PlainReduxAction<typeof SPEC_CLEAR>;
export declare const SPEC_MARK_CHANGE_TYPE = "SPEC_MARK_CHANGE_TYPE";
export declare type SpecMarkChangeType = ReduxAction<typeof SPEC_MARK_CHANGE_TYPE, ShelfMark>;
export declare const SPEC_FIELD_ADD = "SPEC_FIELD_ADD";
export declare type SpecFieldAdd = ReduxAction<typeof SPEC_FIELD_ADD, {
    shelfId: ShelfId;
    fieldDef: ShelfFieldDef;
    replace: boolean;
}>;
export declare const SPEC_FIELD_AUTO_ADD = "SPEC_FIELD_AUTO_ADD";
export declare type SpecFieldAutoAdd = ReduxAction<typeof SPEC_FIELD_AUTO_ADD, {
    fieldDef: ShelfFieldDef;
}>;
export declare const SPEC_FIELD_REMOVE = "SPEC_FIELD_REMOVE";
export declare type SpecFieldRemove = ReduxAction<typeof SPEC_FIELD_REMOVE, ShelfId>;
export declare const SPEC_FIELD_MOVE = "SPEC_FIELD_MOVE";
export declare type SpecFieldMove = ReduxAction<typeof SPEC_FIELD_MOVE, {
    from: ShelfId;
    to: ShelfId;
}>;
/**
 * Change a property of a FieldDef to a specific value.
 */
export declare const SPEC_FIELD_PROP_CHANGE = "SPEC_FIELD_PROP_CHANGE";
export declare type SpecFieldPropChange<P extends 'sort'> = ReduxAction<typeof SPEC_FIELD_PROP_CHANGE, {
    shelfId: ShelfId;
    prop: P;
    value: ShelfFieldDef[P];
}>;
/**
 * Change nested property of a FieldDef to a specific value.
 */
export declare const SPEC_FIELD_NESTED_PROP_CHANGE = "SPEC_FIELD_NESTED_PROP_CHANGE";
export declare type SpecFieldNestedPropChange<P extends 'scale' | 'axis' | 'legend', N extends (keyof ShelfFieldDef[P])> = ReduxAction<typeof SPEC_FIELD_NESTED_PROP_CHANGE, {
    shelfId: ShelfId;
    prop: P;
    nestedProp: N;
    value: ShelfFieldDef[P][N];
}>;
/**
 * Change Function of a FieldDef to a specific value.
 */
export declare const SPEC_FUNCTION_CHANGE = "SPEC_FUNCTION_CHANGE";
export declare type SpecFunctionChange = ReduxAction<typeof SPEC_FUNCTION_CHANGE, {
    shelfId: ShelfId;
    fn: ShelfFunction;
}>;
export declare const SPEC_FUNCTION_ADD_WILDCARD = "SPEC_FUNCTION_ADD_WILDCARD";
export declare type SpecFunctionAddWildcard = ReduxAction<typeof SPEC_FUNCTION_ADD_WILDCARD, {
    shelfId: ShelfId;
    fn: ShelfFunction;
}>;
export declare const SPEC_FUNCTION_DISABLE_WILDCARD = "SPEC_FUNCTION_DISABLE_WILDCARD";
export declare type SpecFunctionDisableWildcard = ReduxAction<typeof SPEC_FUNCTION_DISABLE_WILDCARD, {
    shelfId: ShelfId;
}>;
export declare const SPEC_FUNCTION_ENABLE_WILDCARD = "SPEC_FUNCTION_ENABLE_WILDCARD";
export declare type SpecFunctionEnableWildcard = ReduxAction<typeof SPEC_FUNCTION_ENABLE_WILDCARD, {
    shelfId: ShelfId;
}>;
export declare const SPEC_FUNCTION_REMOVE_WILDCARD = "SPEC_FUNCTION_REMOVE_WILDCARD";
export declare type SpecFunctionRemoveWildcard = ReduxAction<typeof SPEC_FUNCTION_REMOVE_WILDCARD, {
    shelfId: ShelfId;
    fn: ShelfFunction;
}>;
export declare const SPEC_VALUE_CHANGE = "SPEC_VALUE_CHANGE";
export declare type SpecValueChange = ReduxAction<typeof SPEC_VALUE_CHANGE, {
    shelfId: ShelfId;
    valueDef: ShelfValueDef;
}>;
export declare const SPEC_LOAD = "SPEC_LOAD";
export declare type SpecLoad = ReduxAction<typeof SPEC_LOAD, {
    spec: TopLevelFacetedUnitSpec;
    keepWildcardMark: boolean;
}>;
export declare const SPEC_ACTION_TYPE_INDEX: {
    [k in SpecAction['type']]: 1;
};
export declare function isSpecAction(a: Action): a is SpecAction;
