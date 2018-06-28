
import {TopLevelFacetedUnitSpec} from 'vega-lite/build/src/spec';
import {ShelfFieldDef, ShelfFunction, ShelfId, ShelfMark} from '../../models';
import {ShelfValueDef} from '../../models/shelf/spec';
import {Action} from '../index';
import {PlainReduxAction, ReduxAction} from '../redux-action';

export type SpecAction =
  SpecClear |
  SpecMarkChangeType |
  SpecEncodingAction;

export type SpecEncodingAction = SpecFieldAdd | SpecFieldAutoAdd |
  SpecFieldRemove | SpecFieldMove |
  SpecFieldPropChange<any> | SpecFieldNestedPropChange<any, any> |
  SpecFunctionChange |
  SpecFunctionAddWildcard | SpecFunctionRemoveWildcard |
  SpecFunctionDisableWildcard | SpecFunctionEnableWildcard |
  SpecLoad | SpecValueChange;

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
 * Change nested property of a FieldDef to a specific value.
 */
export const SPEC_FIELD_NESTED_PROP_CHANGE = 'SPEC_FIELD_NESTED_PROP_CHANGE';
export type SpecFieldNestedPropChange<
  P extends 'scale' | 'axis' | 'legend',
  N extends (keyof ShelfFieldDef[P])
> = ReduxAction<typeof SPEC_FIELD_NESTED_PROP_CHANGE, {
  shelfId: ShelfId,
  prop: P,
  nestedProp: N,
  value: ShelfFieldDef[P][N]
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

export const SPEC_VALUE_CHANGE = 'SPEC_VALUE_CHANGE';
export type SpecValueChange = ReduxAction<typeof SPEC_VALUE_CHANGE, {
  shelfId: ShelfId,
  valueDef: ShelfValueDef
}>;

export const SPEC_LOAD = 'SPEC_LOAD';
export type SpecLoad = ReduxAction<typeof SPEC_LOAD, {
  spec: TopLevelFacetedUnitSpec,
  keepWildcardMark: boolean
}>;

export const SPEC_ACTION_TYPE_INDEX: {[k in SpecAction['type']]: 1} = {
  SPEC_CLEAR: 1,
  SPEC_LOAD: 1,
  SPEC_MARK_CHANGE_TYPE: 1,

  SPEC_FIELD_ADD: 1,
  SPEC_FIELD_AUTO_ADD: 1,
  SPEC_FIELD_MOVE: 1,
  SPEC_FIELD_PROP_CHANGE: 1,
  SPEC_FIELD_NESTED_PROP_CHANGE: 1,
  SPEC_FIELD_REMOVE: 1,

  SPEC_FUNCTION_CHANGE: 1,
  SPEC_FUNCTION_ADD_WILDCARD: 1,
  SPEC_FUNCTION_DISABLE_WILDCARD: 1,
  SPEC_FUNCTION_ENABLE_WILDCARD: 1,
  SPEC_FUNCTION_REMOVE_WILDCARD: 1,

  SPEC_VALUE_CHANGE: 1
};

export function isSpecAction(a: Action): a is SpecAction {
  return SPEC_ACTION_TYPE_INDEX[a.type];
}
