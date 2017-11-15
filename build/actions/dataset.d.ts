import { ExpandedType } from 'compassql/build/src/query/expandedtype';
import { Schema } from 'compassql/build/src/schema';
import { ThunkAction } from 'redux-thunk';
import { Data, InlineData } from 'vega-lite/build/src/data';
import { State } from '../models/index';
import { ReduxAction } from './redux-action';
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
export declare type DatasetAction = DatasetSchemaChangeFieldType | DatasetSchemaChangeOrdinalDomain | DatasetRequest | DatasetReceive;
export declare type DatasetAsyncAction = DatasetLoad;
export declare const DATASET_REQUEST = "DATASET_REQUEST";
export declare type DatasetRequest = ReduxAction<typeof DATASET_REQUEST, {
    name: string;
}>;
export declare const DATASET_RECEIVE = "DATASET_RECEIVE";
export declare type DatasetReceive = ReduxAction<typeof DATASET_RECEIVE, {
    name: string;
    data: InlineData;
    schema: Schema;
}>;
export declare type DatasetLoad = ThunkAction<void, State, undefined>;
export declare function datasetLoad(name: string, data: Data): DatasetLoad;
