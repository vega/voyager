import {SpecQueryGroup} from 'compassql/build/src/model';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {PlotObject} from '../models/plot';
import {ReduxAction} from './redux-action';

import {fetchCompassQLRecommend} from '../api/api';
import {State} from '../models/index';
import {getConfig, getData, getQuery, getSchema} from '../selectors';
import {Action} from './index';

export type ResultAction = ResultRequest | ResultReceive;
export type ResultAsyncAction = AsyncResultRequest;

export const RESULT_REQUEST = 'RESULT_REQUEST';
export type ResultRequest = ReduxAction<typeof RESULT_REQUEST, {}>;

export const RESULT_RECEIVE = 'RESULT_RECEIVE';
export type ResultReceive = ReduxAction<typeof RESULT_RECEIVE, {
  modelGroup: SpecQueryGroup<PlotObject>
}>;

export type AsyncResultRequest = ThunkAction<void , State, undefined>;
export function resultRequest(): AsyncResultRequest {
  return (dispatch: Dispatch<Action>, getState) => {
    const query = getQuery(getState());
    const schema = getSchema(getState());
    const data = getData(getState());
    const config = getConfig(getState());
    dispatch({
      type: RESULT_REQUEST
    });
    // TODO: pass in config
    return fetchCompassQLRecommend(query, schema, data, config).then(
      modelGroup => {
        dispatch({
          type: RESULT_RECEIVE,
          payload: { modelGroup }
        });
      }
    );
  };
}
