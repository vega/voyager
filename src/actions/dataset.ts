import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Schema} from 'compassql/build/src/schema';
import * as fetch from 'isomorphic-fetch';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ActionCreators} from 'redux-undo';
import {Data, InlineData, isInlineData, isUrlData} from 'vega-lite/build/src/data';
import {fetchCompassQLBuildSchema} from '../api/api';
import {State} from '../models/index';
import {selectConfig} from '../selectors';
import {FILTER_CLEAR} from './filter';
import {Action} from './index';
import {ReduxAction} from './redux-action';
import {SHELF_CLEAR} from './shelf';

export const DATASET_SCHEMA_CHANGE_FIELD_TYPE = 'DATASET_SCHEMA_CHANGE_FIELD_TYPE';
export type DatasetSchemaChangeFieldType = ReduxAction<typeof DATASET_SCHEMA_CHANGE_FIELD_TYPE, {
  field: string,
  type: ExpandedType
}>;

export const DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN = 'DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN';
export type DatasetSchemaChangeOrdinalDomain = ReduxAction<typeof DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN, {
  field: string,
  domain: string[]
}>;

export type DatasetAction = DatasetUrlReceive | DatasetSchemaChangeFieldType | DatasetSchemaChangeOrdinalDomain |
            DatasetUrlRequest | DatasetReceive;
export type DatasetAsyncAction = DatasetLoad;

export const DATASET_URL_REQUEST = 'DATASET_URL_REQUEST';
export type DatasetUrlRequest = ReduxAction<typeof DATASET_URL_REQUEST, {
  name: string,
  url: string
}>;

export const DATASET_URL_RECEIVE = 'DATASET_URL_RECEIVE';
export type DatasetUrlReceive = ReduxAction<typeof DATASET_URL_RECEIVE, {
  name: string,
  url: string,
  schema: Schema
}>;

export const DATASET_INLINE_RECEIVE = 'DATASET_INLINE_RECEIVE';
export type DatasetReceive = ReduxAction<typeof DATASET_INLINE_RECEIVE, {
  name: string,
  data: InlineData,
  schema: Schema,
}>;


export type DatasetLoad = ThunkAction<void , State, undefined>;
export function datasetLoad(name: string, dataset: Data): DatasetLoad {
  return (dispatch: Dispatch<Action>, getState) => {

    const config = selectConfig(getState());
    // Get the new dataset
    if (isUrlData(dataset)) {
      const url = dataset.url;

      dispatch({
        type: DATASET_URL_REQUEST,
        payload: {name, url}
      });

      return fetch(url)
        .then(response => response.json()) // TODO: handle error
        .then(data => fetchCompassQLBuildSchema(data, config)) // TODO: handle error
        .then(schema => {
          // Clear filters
          dispatch({ type: FILTER_CLEAR});
          // Clear history and shelf
          dispatch({ type: SHELF_CLEAR });

          dispatch({
            type: DATASET_URL_RECEIVE,
            payload: {name, url, schema}
          });
          dispatch(ActionCreators.clearHistory());
        });
    } else if (isInlineData(dataset)) {
      return fetchCompassQLBuildSchema(dataset.values, config) // TODO: handle error
        .then(schema => {
          // clear filters
          dispatch({ type: FILTER_CLEAR });
          // Clear history and shelf
          dispatch({ type: SHELF_CLEAR });

          const data = dataset;
          dispatch({
            type: DATASET_INLINE_RECEIVE,
            payload: { name, schema, data }
          });

          dispatch(ActionCreators.clearHistory());
        });
    } else {
      throw new Error('dataset load error: dataset type not detected');
    }


  };
};
