import {SpecQueryModelGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import {Schema} from 'compassql/build/src/schema';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {ReduxAction} from './redux-action';

import {fetchCompassRecommends} from '../api/api';
import {State} from '../models/index';
import {getQuery, getSchema} from '../selectors';
import {Action} from './index';

export type CompassAction = CompassRecommendsRequest | CompassRecommendsRecieve;
export type CompassAsyncAction = CompassRecomendationsLoad;

export const COMPASS_RECOMMENDS_REQUEST = 'COMPASS_RECOMMENDS_REQUEST';
export type CompassRecommendsRequest = ReduxAction<typeof COMPASS_RECOMMENDS_REQUEST, {}>;

export const COMPASS_RECOMMENDS_RECEIVE = 'COMPASS_RECOMMENDS_RECEIVE';
export type CompassRecommendsRecieve = ReduxAction<typeof COMPASS_RECOMMENDS_RECEIVE, {
  recommends: SpecQueryModelGroup
}>;

export type CompassRecomendationsLoad = ThunkAction<void , State, undefined>;
export function compassRecomendationsLoad(query?: Query, schema?: Schema): CompassRecomendationsLoad {
  return (dispatch: Dispatch<Action>, getState) => {
    if (!query) {
      query = getQuery(getState());
    }
    if (!schema) {
      schema = getSchema(getState());
    }
    dispatch({
      type: COMPASS_RECOMMENDS_REQUEST
    });
    return fetchCompassRecommends(query, schema).then(
      recommends => {
        dispatch({
          type: COMPASS_RECOMMENDS_RECEIVE,
          payload: { recommends }
        });
      }
    );
  };
}
