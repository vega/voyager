import { SpecQueryGroup } from 'compassql/build/src/model';
import { Query } from 'compassql/build/src/query/query';
import { ThunkAction } from 'redux-thunk';
import { State } from '../models/index';
import { PlotObject } from '../models/plot';
import { ResultType } from '../models/result';
import { ReduxAction } from './redux-action';
export declare type ResultAction = ResultRequest | ResultReceive | ResultLimitIncrease;
export declare type ResultAsyncAction = AsyncResultRequest;
export declare const RESULT_REQUEST = "RESULT_REQUEST";
export declare type ResultRequest = ReduxAction<typeof RESULT_REQUEST, {
    resultType: ResultType;
}>;
export declare const RESULT_LIMIT_INCREASE = "RESULT_LIMIT_INCREASE";
export declare type ResultLimitIncrease = ReduxAction<typeof RESULT_LIMIT_INCREASE, {
    resultType: ResultType;
    increment: number;
}>;
export declare const RESULT_RECEIVE = "RESULT_RECEIVE";
export declare type ResultReceive = ReduxAction<typeof RESULT_RECEIVE, {
    resultType: ResultType;
    query: Query;
    modelGroup: SpecQueryGroup<PlotObject>;
}>;
export declare type AsyncResultRequest = ThunkAction<void, State, undefined>;
export declare function resultRequest(resultType: ResultType, query: Query): AsyncResultRequest;
