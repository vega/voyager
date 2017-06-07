import {build as buildSchema, Schema} from 'compassql/build/src/schema';
import * as fetch from 'isomorphic-fetch';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ActionCreators} from 'redux-undo';

import {Data, InlineData, isInlineData, isUrlData} from 'vega-lite/build/src/data';
import {State} from '../models/index';
import {Action} from './index';
import {ReduxAction} from './redux-action';
import {SHELF_CLEAR} from './shelf';

export type DatasetAction = DatasetUrlReceive | DatasetUrlRequest | DatasetReceive;
export type DatasetAsyncAction = DatasetLoad;

export const DATASET_URL_REQUEST = 'DATA_URL_REQUEST';
export type DatasetUrlRequest = ReduxAction<typeof DATASET_URL_REQUEST, {
  name: string,
  url: string
}>;

export const DATASET_URL_RECEIVE = 'DATA_URL_RECEIVE';
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
  return (dispatch: Dispatch<Action>) => {
    // Clear the shelf
    dispatch({ type: SHELF_CLEAR });

    // Clear the history
    dispatch(ActionCreators.clearHistory());

    // Get the new dataset
    if (isUrlData(dataset)) {
      const url = dataset.url;

      dispatch({
        type: DATASET_URL_REQUEST,
        payload: {name, url}
      });

      return fetch(url)
        // TODO: handle error
        .then(response => response.json())
        .then(data => {
          const schema = buildSchema(data);
          dispatch({
            type: DATASET_URL_RECEIVE,
            payload: {name, url, schema}
          });
        });
    } else if (isInlineData(dataset)) {
      const schema = buildSchema(dataset.values);
      const data = dataset;
      dispatch({
        type: DATASET_INLINE_RECEIVE,
        payload: { name, schema, data }
      });
    } else {
      throw new Error('dataset load error: dataset type not detected');
    }
  };
};
