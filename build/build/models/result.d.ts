import { SpecQueryGroup } from 'compassql/build/src/model';
import { PlotObject } from '../models/plot';
export interface Result {
    isLoading: boolean;
    modelGroup: SpecQueryGroup<PlotObject> | null;
}
export interface ResultIndex {
    main: Result;
}
export declare const DEFAULT_RESULT: Result;
export declare const DEFAULT_RESULT_INDEX: ResultIndex;
