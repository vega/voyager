import {Schema} from 'compassql/build/src/schema';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import * as fetch from 'isomorphic-fetch';

import {Action} from './index';
import {ReduxAction} from './redux-action';
import {State} from '../models/index';

export type DatasetAction = DatasetUrlReceive | DatasetUrlRequest;
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

export type DatasetUrlLoad = ThunkAction<void ,State, undefined>;

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
        const schema = Schema.build(data);
        dispatch({
          type: DATASET_URL_RECEIVE,
          payload: {name, url, schema}
        });
      }
    )
  }
}
