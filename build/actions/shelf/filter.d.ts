import { DateTime } from 'vega-lite/build/src/datetime';
import { FieldOneOfPredicate, FieldRangePredicate } from 'vega-lite/build/src/predicate';
import { TimeUnit } from 'vega-lite/build/src/timeunit';
import { PlainReduxAction, ReduxAction } from '../redux-action';
export declare type FilterAction = FilterAdd | FilterClear | FilterRemove | FilterToggle | FilterModifyExtent | FilterModifyMinBound | FilterModifyMaxBound | FilterModifyOneOf | FilterModifyTimeUnit;
export declare const FILTER_ADD = "FILTER_ADD";
export declare type FilterAdd = ReduxAction<typeof FILTER_ADD, {
    filter: FieldRangePredicate | FieldOneOfPredicate;
    index?: number;
}>;
export declare const FILTER_TOGGLE = "FILTER_TOGGLE";
export declare type FilterToggle = ReduxAction<typeof FILTER_TOGGLE, {
    filter: FieldRangePredicate | FieldOneOfPredicate;
}>;
export declare const FILTER_REMOVE = "FILTER_REMOVE";
export declare type FilterRemove = ReduxAction<typeof FILTER_REMOVE, {
    index: number;
}>;
export declare const FILTER_CLEAR = "FILTER_CLEAR";
export declare type FilterClear = PlainReduxAction<typeof FILTER_CLEAR>;
export declare const FILTER_MODIFY_EXTENT = "FILTER_MODIFY_EXTENT";
export declare type FilterModifyExtent = ReduxAction<typeof FILTER_MODIFY_EXTENT, {
    range: number[] | DateTime[];
    index: number;
}>;
export declare const FILTER_MODIFY_MIN_BOUND = "FILTER_MODIFY_MIN_BOUND";
export declare type FilterModifyMinBound = ReduxAction<typeof FILTER_MODIFY_MIN_BOUND, {
    minBound: number | DateTime;
    index: number;
}>;
export declare const FILTER_MODIFY_MAX_BOUND = "FILTER_MODIFY_MAX_BOUND";
export declare type FilterModifyMaxBound = ReduxAction<typeof FILTER_MODIFY_MAX_BOUND, {
    maxBound: number | DateTime;
    index: number;
}>;
export declare const FILTER_MODIFY_ONE_OF = "FILTER_MODIFY_ONE_OF";
export declare type FilterModifyOneOf = ReduxAction<typeof FILTER_MODIFY_ONE_OF, {
    oneOf: string[] | number[] | boolean[] | DateTime[];
    index: number;
}>;
export declare const FILTER_MODIFY_TIME_UNIT = "FILTER_MODIFY_TIME_UNIT";
export declare type FilterModifyTimeUnit = ReduxAction<typeof FILTER_MODIFY_TIME_UNIT, {
    timeUnit: TimeUnit;
    index: number;
    domain: number[];
}>;
