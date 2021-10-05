import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Schema} from 'compassql/build/src/schema';
import * as fetch from 'isomorphic-fetch';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ActionCreators} from 'redux-undo';
import {Data, InlineData, isInlineData, isUrlData} from 'vega-lite/build/src/data';
import {isArray} from 'vega-util';
import {fetchCompassQLBuildSchema} from '../api/api';
import {VoyagerConfig} from '../models/config';
import {State} from '../models/index';
import {selectConfig} from '../selectors';
import {Action} from './index';
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
  name: string,
  url: string
}>;

export const DATASET_RECEIVE = 'DATASET_RECEIVE';
export type DatasetReceive = ReduxAction<typeof DATASET_RECEIVE, {
  name: string,
  data: InlineData,
  schema: Schema,
}>;


export type DatasetLoad = ThunkAction<void , State, undefined>;
export function datasetLoad(name: string, data: Data): DatasetLoad {
  return (dispatch: Dispatch<Action>, getState) => {

    const config = selectConfig(getState());

    dispatch({type: RESET});
    dispatch({
      type: DATASET_REQUEST,
      payload: {name}
    });

    // Get the new dataset
    if (isUrlData(data)) {
      return fetch(data.url)
        .then(response => response.json())
        .catch(errorCatch)
        .then((values: any) => {
          return buildSchemaAndDispatchDataReceive({values}, config, dispatch, name);
        });
    } else if (isInlineData(data)) {
      return buildSchemaAndDispatchDataReceive(data, config, dispatch, name);
    } else {
      throw new Error('dataset load error: dataset type not detected');
    }
  };
};

function buildSchemaAndDispatchDataReceive(
  data: InlineData, config: VoyagerConfig, dispatch: Dispatch<Action>, name: string
) {
  if (!isArray(data.values)) {
    throw new Error('Voyager only supports array values');
  }
  return fetchCompassQLBuildSchema(data.values, config)
  .catch(errorCatch)
  .then(schema => {
    dispatch({
      type: DATASET_RECEIVE,
      payload: {name, schema, data}
    });

    dispatch(ActionCreators.clearHistory());
  });
}

function errorCatch(err: Error) {
  window.alert(err.message);
}
