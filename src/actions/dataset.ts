import {Schema} from 'compassql/build/src/schema';
import * as fetch from 'isomorphic-fetch';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ActionCreators} from 'redux-undo';

import {InlineData} from 'vega-lite/build/src/data';
import {fetchCompassQLBuildSchema} from '../api/api';
import {State} from '../models/index';
import {Action} from './index';
import {ReduxAction} from './redux-action';
import {SHELF_CLEAR} from './shelf';

export type DatasetAction = DatasetUrlReceive | DatasetUrlRequest | DatasetInlineReceive;
export type DatasetAsyncAction = DatasetUrlLoad | DatasetReceive;

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
export type DatasetInlineReceive = ReduxAction<typeof DATASET_INLINE_RECEIVE, {
  name: string,
  data: InlineData,
  schema: Schema
}>;


export type DatasetUrlLoad = ThunkAction<void , State, undefined>;

export function datasetUrlLoad(name: string, url: string): DatasetUrlLoad {
  return (dispatch: Dispatch<Action>) => {

    // Clear the shelf
    dispatch({
      type: SHELF_CLEAR
    });

    // Clear the history
    dispatch(ActionCreators.clearHistory());

    // Get the new dataset
    dispatch({
      type: DATASET_URL_REQUEST,
      payload: {name, url}
    });

    return fetch(url).then(
      response => {
        // TODO: handle error
        return response.json();
      }
    ).then(data => fetchCompassQLBuildSchema(data))
     .then(
       schema => {
         dispatch({
           type: DATASET_URL_RECEIVE,
           payload: {name, url, schema}
         });
       }
     );
  };
};

export type DatasetReceive = ThunkAction<void , State, undefined>;
export function datasetReceive(name: string, dataset: InlineData): DatasetReceive {
  return (dispatch: Dispatch<Action>) => {
    return fetchCompassQLBuildSchema(dataset.values).then(
      schema => {
        dispatch({
          type: DATASET_INLINE_RECEIVE,
          payload: {
            name,
            schema,
            data: dataset,
          }
        });
      }
    );
  };
};
