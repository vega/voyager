import { Query } from 'compassql/build/src/query/query';
import { ThunkAction } from 'redux-thunk';
import { Channel } from 'vega-lite/build/src/channel';
import { State } from '../models/index';
import { ResultPlot } from '../models/result';
import { ResultType } from '../models/result';
import { ShelfFieldDef } from '../models/shelf/spec/encoding';
import { Action } from './index';
import { ReduxAction } from './redux-action';
export declare type ResultAction = ResultRequest | ResultReceive | ResultLimitIncrease | ResultModifyAction;
export declare type ResultModifyAction = ResultModifyFieldProp<any> | ResultModifyNestedFieldProp<any, any>;
export declare function isResultAction(action: Action): action is ResultAction;
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
    plots: ResultPlot[];
}>;
export declare const RESULT_MODIFY_FIELD_PROP = "RESULT_MODIFY_FIELD_PROP";
export declare type ResultModifyFieldProp<P extends 'sort'> = ReduxAction<typeof RESULT_MODIFY_FIELD_PROP, {
    resultType: ResultType;
    index: number;
    channel: Channel;
    prop: P;
    value: ShelfFieldDef[P];
}>;
export declare const RESULT_MODIFY_NESTED_FIELD_PROP = "RESULT_MODIFY_NESTED_FIELD_PROP";
export declare type ResultModifyNestedFieldProp<P extends 'scale' | 'axis' | 'legend', N extends keyof ShelfFieldDef[P]> = ReduxAction<typeof RESULT_MODIFY_NESTED_FIELD_PROP, {
    resultType: ResultType;
    index: number;
    channel: Channel;
    prop: P;
    nestedProp: N;
    value: ShelfFieldDef[P][N];
}>;
export declare type AsyncResultRequest = ThunkAction<void, State, undefined>;
export declare function resultRequest(resultType: ResultType, query: Query, filterKey?: string): AsyncResultRequest;
