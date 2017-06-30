import {FilterTransform} from 'vega-lite/build/src/transform';
import {ReduxAction} from './redux-action';

export type FilterAction = FilterAdd | FilterRemove;

export const FILTER_ADD = 'FILTER_ADD';
export type FilterAdd = ReduxAction<typeof FILTER_ADD, {
  filter: FilterTransform
}>;

export const FILTER_REMOVE = 'FILTER_REMOVE';
export type FilterRemove = ReduxAction<typeof FILTER_REMOVE, {
  index: number
}>;
