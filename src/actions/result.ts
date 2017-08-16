
import {Query} from 'compassql/build/src/query/query';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {fetchCompassQLRecommend} from '../api/api';
import {State} from '../models/index';
import {ResultPlot, ResultPlotWithKey} from '../models/result';
import {ResultType} from '../models/result';
import {selectConfig, selectData, selectSchema} from '../selectors';
import {Action} from './index';
import {ReduxAction} from './redux-action';

export type ResultAction = ResultRequest | ResultReceive | ResultLimitIncrease;

type ResultActionType = ResultAction['type'];

const RESULT_ACTION_TYPE_INDEX: {[K in ResultActionType]: 1} = {
  RESULT_REQUEST: 1,
  RESULT_RECEIVE: 1,
  RESULT_LIMIT_INCREASE: 1
};

export function isResultAction(action: Action): action is ResultAction {
  return RESULT_ACTION_TYPE_INDEX[action.type];
}

export type ResultAsyncAction = AsyncResultRequest;

export const RESULT_REQUEST = 'RESULT_REQUEST';
export type ResultRequest = ReduxAction<typeof RESULT_REQUEST, {
  resultType: ResultType
}>;

export const RESULT_LIMIT_INCREASE = 'RESULT_LIMIT_INCREASE';
export type ResultLimitIncrease = ReduxAction<typeof RESULT_LIMIT_INCREASE, {
  resultType: ResultType,
  increment: number
}>;

export const RESULT_RECEIVE = 'RESULT_RECEIVE';
export type ResultReceive = ReduxAction<typeof RESULT_RECEIVE, {
  resultType: ResultType,
  query: Query,
  plots: ResultPlot[]
}>;

export type AsyncResultRequest = ThunkAction<void , State, undefined>;
export function resultRequest(resultType: ResultType, query: Query, filterKey?: string): AsyncResultRequest {
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
      (preFilteredPlots: ResultPlotWithKey[]) => {
        const plots: ResultPlot[] = (
          filterKey ?
          preFilteredPlots.filter(p => p.groupByKey !== filterKey) :
          preFilteredPlots
        ).map(p => p.plot);

        dispatch({
          type: RESULT_RECEIVE,
          payload: {query, plots, resultType}
        });
      }
    );
  };
}
