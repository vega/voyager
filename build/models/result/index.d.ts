import { Query } from 'compassql/build/src/query/query';
import { ResultPlot } from './plot';
export * from './plot';
export interface Result {
    isLoading: boolean;
    plots: ResultPlot[] | null;
    query: Query;
    limit: number;
}
export interface ResultIndex {
    main: Result;
    addCategoricalField: Result;
    addQuantitativeField: Result;
    addTemporalField: Result;
    alternativeEncodings: Result;
    histograms: Result;
    summaries: Result;
}
export declare const DEFAULT_RESULT: Result;
export declare const DEFAULT_RESULT_INDEX: ResultIndex;
export declare type ResultType = keyof ResultIndex;
export declare const RESULT_TYPES: ResultType[];
