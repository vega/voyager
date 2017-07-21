import { Schema } from 'compassql/build/src/schema';
import { ThunkAction } from 'redux-thunk';
import { Data, InlineData } from 'vega-lite/build/src/data';
import { State } from '../models/index';
import { ReduxAction } from './redux-action';
import { ExpandedType } from 'compassql/build/src/query/expandedtype';
export declare const DATASET_SCHEMA_CHANGE_FIELD_TYPE = "DATASET_SCHEMA_CHANGE_FIELD_TYPE";
export declare type DatasetSchemaChangeFieldType = ReduxAction<typeof DATASET_SCHEMA_CHANGE_FIELD_TYPE, {
    field: string;
    type: ExpandedType;
}>;
export declare const DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN = "DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN";
export declare type DatasetSchemaChangeOrdinalDomain = ReduxAction<typeof DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN, {
    field: string;
    domain: string[];
}>;
export declare type DatasetAction = DatasetUrlReceive | DatasetSchemaChangeFieldType | DatasetSchemaChangeOrdinalDomain | DatasetUrlRequest | DatasetReceive;
export declare type DatasetAsyncAction = DatasetLoad;
export declare const DATASET_URL_REQUEST = "DATASET_URL_REQUEST";
export declare type DatasetUrlRequest = ReduxAction<typeof DATASET_URL_REQUEST, {
    name: string;
    url: string;
}>;
export declare const DATASET_URL_RECEIVE = "DATASET_URL_RECEIVE";
export declare type DatasetUrlReceive = ReduxAction<typeof DATASET_URL_RECEIVE, {
    name: string;
    url: string;
    schema: Schema;
}>;
export declare const DATASET_INLINE_RECEIVE = "DATASET_INLINE_RECEIVE";
export declare type DatasetReceive = ReduxAction<typeof DATASET_INLINE_RECEIVE, {
    name: string;
    data: InlineData;
    schema: Schema;
}>;
export declare type DatasetLoad = ThunkAction<void, State, undefined>;
export declare function datasetLoad(name: string, dataset: Data): DatasetLoad;
