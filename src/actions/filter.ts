import {DateTime} from 'vega-lite/build/src/datetime';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {PlainReduxAction, ReduxAction} from './redux-action';

export type FilterAction = FilterAdd | FilterClear | FilterRemove | FilterModifyBothBounds| FilterModifyMinBound |
FilterModifyMaxBound | FilterModifyOneOf;

export const FILTER_ADD = 'FILTER_ADD';
export type FilterAdd = ReduxAction<typeof FILTER_ADD, {
  filter: RangeFilter | OneOfFilter,
  index?: number
}>;

export const FILTER_REMOVE = 'FILTER_REMOVE';
export type FilterRemove = ReduxAction<typeof FILTER_REMOVE, {
  index: number
}>;

export const FILTER_CLEAR = 'FILTER_CLEAR';
export type FilterClear = PlainReduxAction<typeof FILTER_CLEAR>;

export const FILTER_MODIFY_BOTH_BOUNDS = 'FILTER_MODIFY_BOTH_BOUNDS';
export type FilterModifyBothBounds = ReduxAction<typeof FILTER_MODIFY_BOTH_BOUNDS, {
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
