import { Action } from '../actions';
import { ResultIndex } from '../models';
import { ResultType } from '../models/result';
export declare const DEFAULT_LIMIT: {
    [K in ResultType]: number;
};
export declare function resultIndexReducer(state: Readonly<ResultIndex>, action: Action): ResultIndex;
