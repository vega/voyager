import {build as buildSchema, Schema} from 'compassql/build/src/schema';
import * as fetch from 'isomorphic-fetch';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';

import {InlineData} from 'vega-lite/build/src/data';
import {State} from '../models/index';
import {Action} from './index';
import {ReduxAction} from './redux-action';

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

export const DATASET_RECEIVE = 'DATASET_RECEIVE';
export type DatasetReceive = ReduxAction<typeof DATASET_RECEIVE, {
  name: string,
  data: InlineData,
  schema: Schema,
}>;

export function datasetReceive(name: string, dataset: InlineData): DatasetReceive {
  const schema = buildSchema(dataset.values);
  return {
    type: DATASET_RECEIVE,
    payload: {
      name,
      schema,
      data: dataset,
    }
  };
};
