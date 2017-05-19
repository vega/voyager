import {SpecQueryModelGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import {Schema} from 'compassql/build/src/schema';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ReduxAction} from './redux-action';

import {fetchResultRecommends} from '../api/api';
import {State} from '../models/index';
import {getQuery, getSchema} from '../selectors';
import {Action} from './index';

export type ResultAction = ResultRecommendsRequest | ResultRecommendsRecieve;
export type ResultAsyncAction = ResultRecomendationsLoad;

export const RESULT_RECOMMENDS_REQUEST = 'RESULT_RECOMMENDS_REQUEST';
export type ResultRecommendsRequest = ReduxAction<typeof RESULT_RECOMMENDS_REQUEST, {}>;

export const RESULT_RECOMMENDS_RECEIVE = 'RESULT_RECOMMENDS_RECEIVE';
export type ResultRecommendsRecieve = ReduxAction<typeof RESULT_RECOMMENDS_RECEIVE, {
  modelGroup: SpecQueryModelGroup
}>;

export type ResultRecomendationsLoad = ThunkAction<void , State, undefined>;
export function resultRequest(query?: Query, schema?: Schema): ResultRecomendationsLoad {
  return (dispatch: Dispatch<Action>, getState) => {
    if (!query) {
      query = getQuery(getState());
    }
    if (!schema) {
      schema = getSchema(getState());
    }
    dispatch({
      type: RESULT_RECOMMENDS_REQUEST
    });
    return fetchResultRecommends(query, schema).then(
      modelGroup => {
        dispatch({
          type: RESULT_RECOMMENDS_RECEIVE,
          payload: { modelGroup }
        });
      }
    );
  };
}
