
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {ShelfFieldDef, ShelfFunction, ShelfId, ShelfMark} from '../../models';
import {PlainReduxAction, ReduxAction} from '../redux-action';

export type SpecAction =
  SpecClear |
  SpecMarkChangeType |
  SpecEncodingAction;

export type SpecEncodingAction = SpecFieldAdd | SpecFieldAutoAdd |
  SpecFieldRemove | SpecFieldMove |
  SpecFieldPropChange<any> |
  SpecFunctionChange |
  SpecFunctionAddWildcard | SpecFunctionRemoveWildcard |
  SpecFunctionDisableWildcard | SpecFunctionEnableWildcard |
  SpecLoad ;

export const SPEC_CLEAR = 'SPEC_CLEAR';
export type SpecClear = PlainReduxAction<typeof SPEC_CLEAR>;

export const SPEC_MARK_CHANGE_TYPE = 'SPEC_MARK_CHANGE_TYPE';
export type SpecMarkChangeType = ReduxAction<typeof SPEC_MARK_CHANGE_TYPE, ShelfMark>;

// Field

export const SPEC_FIELD_ADD = 'SPEC_FIELD_ADD';
export type SpecFieldAdd = ReduxAction<typeof SPEC_FIELD_ADD, {
  shelfId: ShelfId;
  fieldDef: ShelfFieldDef;
  replace: boolean;
}>;

export const SPEC_FIELD_AUTO_ADD = 'SPEC_FIELD_AUTO_ADD';
export type SpecFieldAutoAdd = ReduxAction<typeof SPEC_FIELD_AUTO_ADD, {
  fieldDef: ShelfFieldDef;
}>;

export const SPEC_FIELD_REMOVE = 'SPEC_FIELD_REMOVE';
export type SpecFieldRemove = ReduxAction<typeof SPEC_FIELD_REMOVE, ShelfId>;


export const SPEC_FIELD_MOVE = 'SPEC_FIELD_MOVE';
export type SpecFieldMove = ReduxAction<typeof SPEC_FIELD_MOVE, {
  from: ShelfId,
  to: ShelfId
}>;

/**
 * Change a property of a FieldDef to a specific value.
 */
export const SPEC_FIELD_PROP_CHANGE = 'SPEC_FIELD_PROP_CHANGE';
export type SpecFieldPropChange<
  P extends 'sort' // TODO: 'stack' | 'format'
> = ReduxAction<typeof SPEC_FIELD_PROP_CHANGE, {
  shelfId: ShelfId;
  prop: P;
  value: ShelfFieldDef[P];
}>;


/**
 * Change Function of a FieldDef to a specific value.
 */
export const SPEC_FUNCTION_CHANGE = 'SPEC_FUNCTION_CHANGE';
export type SpecFunctionChange = ReduxAction<typeof SPEC_FUNCTION_CHANGE, {
  shelfId: ShelfId,
  fn: ShelfFunction;
}>;

export const SPEC_FUNCTION_ADD_WILDCARD = 'SPEC_FUNCTION_ADD_WILDCARD';
export type SpecFunctionAddWildcard = ReduxAction<typeof SPEC_FUNCTION_ADD_WILDCARD, {
  shelfId: ShelfId,
  fn: ShelfFunction
}>;

export const SPEC_FUNCTION_DISABLE_WILDCARD = 'SPEC_FUNCTION_DISABLE_WILDCARD';
export type SpecFunctionDisableWildcard = ReduxAction<typeof SPEC_FUNCTION_DISABLE_WILDCARD, {
  shelfId: ShelfId
}>;

export const SPEC_FUNCTION_ENABLE_WILDCARD = 'SPEC_FUNCTION_ENABLE_WILDCARD';
export type SpecFunctionEnableWildcard = ReduxAction<typeof SPEC_FUNCTION_ENABLE_WILDCARD, {
  shelfId: ShelfId
}>;

export const SPEC_FUNCTION_REMOVE_WILDCARD = 'SPEC_FUNCTION_REMOVE_WILDCARD';
export type SpecFunctionRemoveWildcard = ReduxAction<typeof SPEC_FUNCTION_REMOVE_WILDCARD, {
  shelfId: ShelfId,
  fn: ShelfFunction
}>;

export const SPEC_LOAD = 'SPEC_LOAD';
export type SpecLoad = ReduxAction<typeof SPEC_LOAD, {
  spec: FacetedCompositeUnitSpec,
  keepWildcardMark: boolean
}>;
