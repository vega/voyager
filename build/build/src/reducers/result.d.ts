import { Action } from '../actions';
import { Result, ResultIndex } from '../models';
export declare function mainResultReducer(state: Readonly<Result>, action: Action): Result;
export declare function resultReducer(state: Readonly<ResultIndex>, action: Action): {
    main: Result;
};
