import {Query} from 'compassql/build/src/query/query';
import {ReduxAction} from '../redux-action';
import {FilterAction} from './filter';
import {SpecAction} from './spec';

export * from './filter';
export * from './spec';

export type ShelfAction = FilterAction | SpecAction | ShelfLoadQuery;

export const SHELF_LOAD_QUERY = 'SHELF_LOAD_QUERY';
export type ShelfLoadQuery = ReduxAction<typeof SHELF_LOAD_QUERY, {
  query: Query
}>;
