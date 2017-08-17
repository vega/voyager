
import {Query} from 'compassql/build/src/query/query';
import {Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {Channel} from 'vega-lite/build/src/channel';
import {fetchCompassQLRecommend} from '../api/api';
import {State} from '../models/index';
import {ResultPlot, ResultPlotWithKey} from '../models/result';
import {ResultType} from '../models/result';
import {ShelfFieldDef} from '../models/shelf/spec/encoding';
import {selectConfig, selectData, selectSchema} from '../selectors';
import {Action} from './index';
import {ReduxAction} from './redux-action';

export type ResultAction = ResultRequest | ResultReceive | ResultLimitIncrease | ResultModifyAction;

export type ResultModifyAction = ResultModifyFieldProp<any> | ResultModifyNestedFieldProp<any, any>;

type ResultActionType = ResultAction['type'];

const RESULT_ACTION_TYPE_INDEX: {[K in ResultActionType]: 1} = {
  RESULT_REQUEST: 1,
  RESULT_RECEIVE: 1,
  RESULT_LIMIT_INCREASE: 1,
  // Result modify actions
  RESULT_MODIFY_FIELD_PROP: 1,
  RESULT_MODIFY_NESTED_FIELD_PROP: 1
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

export const RESULT_MODIFY_FIELD_PROP = 'RESULT_MODIFY_FIELD_PROP';
export type ResultModifyFieldProp<
  P extends 'sort' // TODO: stack and format
> = ReduxAction<typeof RESULT_MODIFY_FIELD_PROP, {
  resultType: ResultType,
  index: number,
  channel: Channel,
  prop: P
  value: ShelfFieldDef[P]
}>;

export const RESULT_MODIFY_NESTED_FIELD_PROP = 'RESULT_MODIFY_NESTED_FIELD_PROP';
export type ResultModifyNestedFieldProp<
  P extends 'scale' | 'axis' | 'legend',
  N extends keyof ShelfFieldDef[P]
> = ReduxAction<typeof RESULT_MODIFY_NESTED_FIELD_PROP, {
  resultType: ResultType,
  index: number,
  channel: Channel,
  prop: P,
  nestedProp: N,
  value: ShelfFieldDef[P][N]
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
