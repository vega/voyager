import {SpecQueryGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {fetchCompassQLRecommend} from '../api/api';
import {State} from '../models/index';
import {PlotObject} from '../models/plot';
import {ResultType} from '../models/result';
import {selectConfig, selectData, selectSchema} from '../selectors';
import {Action} from './index';
import {ReduxAction} from './redux-action';

export type ResultAction = ResultRequest | ResultReceive;
export type ResultAsyncAction = AsyncResultRequest;

export const RESULT_REQUEST = 'RESULT_REQUEST';
export type ResultRequest = ReduxAction<typeof RESULT_REQUEST, {
  resultType: ResultType
}>;

export const RESULT_RECEIVE = 'RESULT_RECEIVE';
export type ResultReceive = ReduxAction<typeof RESULT_RECEIVE, {
  resultType: ResultType,
  modelGroup: SpecQueryGroup<PlotObject>
}>;

export type AsyncResultRequest = ThunkAction<void , State, undefined>;
export function resultRequest(resultType: ResultType, query: Query): AsyncResultRequest {
  return (dispatch: Dispatch<Action>, getState) => {
    const schema = selectSchema(getState());
    const data = selectData(getState());
    const config = selectConfig(getState());
    dispatch({
      type: RESULT_REQUEST,
      payload: {resultType}
    });
    // TODO: pass in config
    return fetchCompassQLRecommend(query, schema, data, config).then(
      modelGroup => {
        dispatch({
          type: RESULT_RECEIVE,
          payload: {modelGroup, resultType}
        });
      }
    );
  };
}
