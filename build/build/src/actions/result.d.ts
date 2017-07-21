import { SpecQueryGroup } from 'compassql/build/src/model';
import { ThunkAction } from 'redux-thunk';
import { PlotObject } from '../models/plot';
import { ReduxAction } from './redux-action';
import { State } from '../models/index';
export declare type ResultAction = ResultRequest | ResultReceive;
export declare type ResultAsyncAction = AsyncResultRequest;
export declare const RESULT_REQUEST = "RESULT_REQUEST";
export declare type ResultRequest = ReduxAction<typeof RESULT_REQUEST, {}>;
export declare const RESULT_RECEIVE = "RESULT_RECEIVE";
export declare type ResultReceive = ReduxAction<typeof RESULT_RECEIVE, {
    modelGroup: SpecQueryGroup<PlotObject>;
}>;
export declare type AsyncResultRequest = ThunkAction<void, State, undefined>;
export declare function resultRequest(): AsyncResultRequest;
