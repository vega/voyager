import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {ReduxAction} from './redux-action';

export type FilterAction = FilterAdd | FilterRemove | FilterModify;

export const FILTER_ADD = 'FILTER_ADD';
export type FilterAdd = ReduxAction<typeof FILTER_ADD, {
  filter: RangeFilter | OneOfFilter,
  index: number
}>;

export const FILTER_REMOVE = 'FILTER_REMOVE';
export type FilterRemove = ReduxAction<typeof FILTER_REMOVE, {
  index: number
}>;

export const FILTER_MODIFY = 'FILTER_MODIFY';
export type FilterModify = ReduxAction<typeof FILTER_MODIFY, {
  modifier: (filter: RangeFilter | OneOfFilter) => (RangeFilter | OneOfFilter),
  index: number
}>;
