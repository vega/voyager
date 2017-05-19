import {SpecQueryModelGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import {Schema} from 'compassql/build/src/schema';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ReduxAction} from './redux-action';

import {fetchCompassQLResult} from '../api/api';
import {State} from '../models/index';
import {getQuery, getSchema} from '../selectors';
import {Action} from './index';

export type ResultAction = ResultRequest | ResultReceive;
export type ResultAsyncAction = AsyncResultRequest;

export const RESULT_REQUEST = 'RESULT_REQUEST';
export type ResultRequest = ReduxAction<typeof RESULT_REQUEST, {}>;

export const RESULT_RECEIVE = 'RESULT_RECEIVE';
export type ResultReceive = ReduxAction<typeof RESULT_RECEIVE, {
  modelGroup: SpecQueryModelGroup
}>;

export type AsyncResultRequest = ThunkAction<void , State, undefined>;
export function resultRequest(query?: Query, schema?: Schema): AsyncResultRequest {
  return (dispatch: Dispatch<Action>, getState) => {
    if (!query) {
      query = getQuery(getState());
    }
    if (!schema) {
      schema = getSchema(getState());
    }
    dispatch({
      type: RESULT_REQUEST
    });
    return fetchCompassQLResult(query, schema).then(
      modelGroup => {
        dispatch({
          type: RESULT_RECEIVE,
          payload: { modelGroup }
        });
      }
    );
  };
}
