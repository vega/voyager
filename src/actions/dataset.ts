import {build as buildSchema, Schema} from 'compassql/build/src/schema';
import * as fetch from 'isomorphic-fetch';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ActionCreators} from 'redux-undo';

import {InlineData} from 'vega-lite/build/src/data';
import {State} from '../models/index';
import {Action} from './index';
import {ReduxAction} from './redux-action';
import {SHELF_CLEAR} from './shelf';

export type DatasetAction = DatasetUrlReceive | DatasetUrlRequest | DatasetReceive;
export type DatasetAsyncAction = DatasetUrlLoad;

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
    ).then(
      data => {
        const schema = buildSchema(data);
        dispatch({
          type: DATASET_URL_RECEIVE,
          payload: {name, url, schema}
        });
      }
    );
  };
};

export const DATASET_INLINE_RECEIVE = 'DATASET_INLINE_RECEIVE';
export type DatasetReceive = ReduxAction<typeof DATASET_INLINE_RECEIVE, {
  name: string,
  data: InlineData,
  schema: Schema,
}>;

export type DatasetLoad = ThunkAction<void , State, undefined>;
export function datasetLoad(name: string, dataset: InlineData): DatasetLoad {
  return (dispatch: Dispatch<Action>) => {

    // Clear the shelf
    dispatch({
      type: SHELF_CLEAR
    });

    // Clear the history
    dispatch(ActionCreators.clearHistory());

    // Get the new dataset
    const schema = buildSchema(dataset.values);
    dispatch({
      type: DATASET_INLINE_RECEIVE,
      payload: {
        name,
        schema,
        data: dataset,
      }
    });

  };
};
