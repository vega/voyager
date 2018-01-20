import {Query} from 'compassql/build/src/query/query';
import {ShelfGroupBy} from '../../models';
import {ReduxAction} from '../redux-action';
import {FilterAction} from './filter';
import {SpecAction} from './spec';

export * from './filter';
export * from './spec';

export type ShelfAction = FilterAction | SpecAction | ShelfLoadQuery | ShelfAutoAddCountChange | ShelfGroupByChange;

export const SHELF_LOAD_QUERY = 'SHELF_LOAD_QUERY';
export type ShelfLoadQuery = ReduxAction<typeof SHELF_LOAD_QUERY, {
  query: Query
}>;

export const SHELF_AUTO_ADD_COUNT_CHANGE = 'SHELF_AUTO_ADD_COUNT_CHANGE';
export type ShelfAutoAddCountChange = ReduxAction<typeof SHELF_AUTO_ADD_COUNT_CHANGE, {
  autoAddCount: boolean
}>;

export const SHELF_GROUP_BY_CHANGE = 'SHELF_GROUP_BY_CHANGE';
export type ShelfGroupByChange = ReduxAction<typeof SHELF_GROUP_BY_CHANGE, {
  groupBy: ShelfGroupBy
}>;
