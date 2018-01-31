import { Query } from 'compassql/build/src/query/query';
import { ShelfGroupBy } from '../../models';
import { ReduxAction } from '../redux-action';
import { FilterAction } from './filter';
import { SpecAction } from './spec';
export * from './filter';
export * from './spec';
export declare type ShelfAction = FilterAction | SpecAction | ShelfLoadQuery | ShelfAutoAddCountChange | ShelfGroupByChange;
export declare const SHELF_LOAD_QUERY = "SHELF_LOAD_QUERY";
export declare type ShelfLoadQuery = ReduxAction<typeof SHELF_LOAD_QUERY, {
    query: Query;
}>;
export declare const SHELF_AUTO_ADD_COUNT_CHANGE = "SHELF_AUTO_ADD_COUNT_CHANGE";
export declare type ShelfAutoAddCountChange = ReduxAction<typeof SHELF_AUTO_ADD_COUNT_CHANGE, {
    autoAddCount: boolean;
}>;
export declare const SHELF_GROUP_BY_CHANGE = "SHELF_GROUP_BY_CHANGE";
export declare type ShelfGroupByChange = ReduxAction<typeof SHELF_GROUP_BY_CHANGE, {
    groupBy: ShelfGroupBy;
}>;
