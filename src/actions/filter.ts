import {FilterTransform} from 'vega-lite/build/src/transform';
import {ReduxAction} from './redux-action';

export type FilterAction = AddRangeFilter | AddOneOfFilter | RemoveRangeFilter | RemoveOneOfFilter ;

export const ADD_RANGE_FILTER = 'ADD_RANGE_FILTER';
export type AddRangeFilter = ReduxAction<typeof ADD_RANGE_FILTER, {
  filter: FilterTransform
}>;

export const REMOVE_RANGE_FILTER = 'REMOVE_RANGE_FILTER';
export type RemoveRangeFilter = ReduxAction<typeof REMOVE_RANGE_FILTER, {
  filter: FilterTransform
}>;

export const ADD_ONE_OF_FILTER = 'ADD_ONE_OF_FILTER';
export type AddOneOfFilter = ReduxAction<typeof ADD_ONE_OF_FILTER, {
  filter: FilterTransform
}>;

export const REMOVE_ONE_OF_FILTER = 'REMOVE_ONE_OF_FILTER';
export type RemoveOneOfFilter = ReduxAction<typeof REMOVE_ONE_OF_FILTER, {
  filter: FilterTransform
}>;


