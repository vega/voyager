import {SpecQueryModelGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import {recommend} from 'compassql/build/src/recommend';
import {build as buildSchema, Schema} from 'compassql/build/src/schema';
import * as fetch from 'isomorphic-fetch';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';

import {State} from '../models/index';
import {getQuery} from '../selectors';
import {Action} from './index';
import {ReduxAction} from './redux-action';

export type DatasetAction = DatasetUrlReceive | DatasetUrlRequest | DatasetRecommendsRequest | DatasetRecommendsRecieve;
export type DatasetAsyncAction = DatasetUrlLoad | DatasetRecomendationsLoad;

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

export const DATASET_RECOMMENDS_REQUEST = 'DATASET_RECOMMENDS_REQUEST';
export type DatasetRecommendsRequest = ReduxAction<typeof DATASET_RECOMMENDS_REQUEST, {}>;

export const DATASET_RECOMMENDS_RECEIVE = 'DATASET_RECOMMENDS_RECEIVE';
export type DatasetRecommendsRecieve = ReduxAction<typeof DATASET_RECOMMENDS_RECEIVE, {
  recommends: SpecQueryModelGroup
}>;

export type DatasetUrlLoad = ThunkAction<void , State, undefined>;

export function datasetUrlLoad(name: string, url: string): DatasetUrlLoad {
  return (dispatch: Dispatch<Action>, getState: Function) => {
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
        return { schema };
      }
    ).then(
      result => {
        const query = getQuery(getState());
        // <any> allows us to pass in thunk to dispatch
        return dispatch<any>(datasetRecomendationsLoad(query, result.schema));
      }
    );
  };
}

export type DatasetRecomendationsLoad = ThunkAction<void , State, undefined>;
export function datasetRecomendationsLoad(query: Query, schema: Schema): DatasetRecomendationsLoad {
  return (dispatch: Dispatch<Action>) => {
    dispatch({
      type: DATASET_RECOMMENDS_REQUEST
    });
    // TODO: this should be async
    const recommends = recommend(query, schema).result;
    return dispatch({
      type: DATASET_RECOMMENDS_RECEIVE,
      payload: { recommends }
    });
  };
}
