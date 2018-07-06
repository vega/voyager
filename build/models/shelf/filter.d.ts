import { DateTime } from 'vega-lite/build/src/datetime';
import { FieldOneOfPredicate, FieldRangePredicate } from 'vega-lite/build/src/predicate';
import { TimeUnit } from 'vega-lite/build/src/timeunit';
import { Transform } from 'vega-lite/build/src/transform';
import { ShelfFieldDef } from './spec';
export declare type ShelfFilter = FieldRangePredicate | FieldOneOfPredicate;
export declare function fromTransforms(transforms: Transform[]): ShelfFilter[];
export declare function toTransforms(filters: Array<FieldRangePredicate | FieldOneOfPredicate>): {
    filter: ShelfFilter;
}[];
/**
 * Return a dataflow expression function for a given array of filter.
 * Following example code from https://github.com/uwdata/dataflow-api/blob/master/test/filter-test.js
 */
export declare function toPredicateFunction(filters: ShelfFilter[]): (d: object) => boolean;
export declare function createDefaultFilter(fieldDef: ShelfFieldDef, domain: any[]): FieldRangePredicate | FieldOneOfPredicate;
export declare function getAllTimeUnits(): ("date" | "day" | "month" | "year" | "quarter" | "hours" | "minutes" | "seconds" | "milliseconds" | "yearmonthdate")[];
export declare function getDefaultTimeRange(domain: number[], timeUnit: TimeUnit): number[] | DateTime[];
export declare function getDefaultList(timeUnit: TimeUnit): string[];
export declare function convertToDateTimeObject(timeStamp: number): DateTime;
export declare function convertToTimestamp(dateTime: DateTime): number;
export declare function filterIndexOf(filters: Array<FieldRangePredicate | FieldOneOfPredicate>, field: string): number;
export declare function filterHasField(filters: Array<FieldRangePredicate | FieldOneOfPredicate>, field: string): boolean;
