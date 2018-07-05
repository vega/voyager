import {DateTime} from 'vega-lite/build/src/datetime';
import {FieldOneOfPredicate, FieldRangePredicate} from 'vega-lite/build/src/predicate';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {PlainReduxAction, ReduxAction} from '../redux-action';

export type FilterAction = FilterAdd | FilterClear | FilterRemove | FilterToggle | FilterModifyExtent |
  FilterModifyMinBound | FilterModifyMaxBound | FilterModifyOneOf | FilterModifyTimeUnit;

export const FILTER_ADD = 'FILTER_ADD';
export type FilterAdd = ReduxAction<typeof FILTER_ADD, {
  filter: FieldRangePredicate | FieldOneOfPredicate,
  index?: number
}>;

export const FILTER_TOGGLE = 'FILTER_TOGGLE';
export type FilterToggle = ReduxAction<typeof FILTER_TOGGLE, {
  filter: FieldRangePredicate |FieldOneOfPredicate
}>;

export const FILTER_REMOVE = 'FILTER_REMOVE';
export type FilterRemove = ReduxAction<typeof FILTER_REMOVE, {
  index: number
}>;

export const FILTER_CLEAR = 'FILTER_CLEAR';
export type FilterClear = PlainReduxAction<typeof FILTER_CLEAR>;

export const FILTER_MODIFY_EXTENT = 'FILTER_MODIFY_EXTENT';
export type FilterModifyExtent = ReduxAction<typeof FILTER_MODIFY_EXTENT, {
  range: number[] | DateTime[],
  index: number
}>;

export const FILTER_MODIFY_MIN_BOUND = 'FILTER_MODIFY_MIN_BOUND';
export type FilterModifyMinBound = ReduxAction<typeof FILTER_MODIFY_MIN_BOUND, {
  minBound: number | DateTime,
  index: number
}>;

export const FILTER_MODIFY_MAX_BOUND = 'FILTER_MODIFY_MAX_BOUND';
export type FilterModifyMaxBound = ReduxAction<typeof FILTER_MODIFY_MAX_BOUND, {
  maxBound: number | DateTime,
  index: number
}>;

export const FILTER_MODIFY_ONE_OF = 'FILTER_MODIFY_ONE_OF';
export type FilterModifyOneOf = ReduxAction<typeof FILTER_MODIFY_ONE_OF, {
  oneOf: string[] | number[] | boolean[] | DateTime[],
  index: number
}>;

export const FILTER_MODIFY_TIME_UNIT = 'FILTER_MODIFY_TIME_UNIT';
export type FilterModifyTimeUnit = ReduxAction<typeof FILTER_MODIFY_TIME_UNIT, {
  timeUnit: TimeUnit,
  index: number,
  domain: number[]
}>;
