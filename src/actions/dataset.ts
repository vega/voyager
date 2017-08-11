import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Schema} from 'compassql/build/src/schema';
import * as fetch from 'isomorphic-fetch';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ActionCreators} from 'redux-undo';
import {Data, InlineData, isInlineData, isUrlData, UrlData} from 'vega-lite/build/src/data';
import {fetchCompassQLBuildSchema} from '../api/api';
import {State} from '../models/index';
import {selectConfig} from '../selectors';
import {Action} from './index';
import {LOG_ERRORS_ADD} from './log';
import {ReduxAction} from './redux-action';
import {RESET} from './reset';

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

export type DatasetAction = DatasetSchemaChangeFieldType | DatasetSchemaChangeOrdinalDomain |
            DatasetRequest | DatasetReceive;
export type DatasetAsyncAction = DatasetLoad;

export const DATASET_REQUEST = 'DATASET_REQUEST';
export type DatasetRequest = ReduxAction<typeof DATASET_REQUEST, {
  name: string
}>;

export const DATASET_RECEIVE = 'DATASET_RECEIVE';
export type DatasetReceive = ReduxAction<typeof DATASET_RECEIVE, {
  name: string,
  data: InlineData | UrlData,
  schema: Schema,
}>;


export type DatasetLoad = ThunkAction<void , State, undefined>;
export function datasetLoad(name: string, dataset: Data): DatasetLoad {
  return (dispatch: Dispatch<Action>, getState) => {

    const config = selectConfig(getState());

    dispatch({type: RESET});
    dispatch({
      type: DATASET_REQUEST,
      payload: {name}
    });
    // Get the new dataset
    if (isUrlData(dataset)) {
      const url = dataset.url;

      return fetch(url)
        .then(response => response.json()) // TODO: handle error
        .then(data => fetchCompassQLBuildSchema(data, config)) // TODO: handle error
        .then(schema => {

          dispatch({
            type: DATASET_RECEIVE,
            payload: {name, data: {url}, schema}
          });
          dispatch(ActionCreators.clearHistory());
        });
    } else if (isInlineData(dataset)) {
      return fetchCompassQLBuildSchema(dataset.values, config) // TODO: handle error
        .then(schema => {
          const data = dataset;
          dispatch({
            type: DATASET_RECEIVE,
            payload: {name, schema, data}
          });

          dispatch(ActionCreators.clearHistory());
        });
    } else {
      dispatch({
        type: LOG_ERRORS_ADD,
        payload: {
          errors: ['dataset load error: dataset type not detected']
        }
      });
    }


  };
};
