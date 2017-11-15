import { DateTime } from 'vega-lite/build/src/datetime';
import { OneOfFilter, RangeFilter } from 'vega-lite/build/src/filter';
import { TimeUnit } from 'vega-lite/build/src/timeunit';
import { Transform } from 'vega-lite/build/src/transform';
import { ShelfFieldDef } from './spec';
export declare type ShelfFilter = RangeFilter | OneOfFilter;
export declare function fromTransforms(transforms: Transform[]): ShelfFilter[];
export declare function toTransforms(filters: Array<RangeFilter | OneOfFilter>): {
    filter: ShelfFilter;
}[];
/**
 * Return a dataflow expression function for a given array of filter.
 * Following example code from https://github.com/uwdata/dataflow-api/blob/master/test/filter-test.js
 */
export declare function toPredicateFunction(filters: ShelfFilter[]): (d: object) => boolean;
export declare function createDefaultFilter(fieldDef: ShelfFieldDef, domain: any[]): RangeFilter | OneOfFilter;
export declare function getAllTimeUnits(): ("day" | "month" | "year" | "quarter" | "date" | "hours" | "minutes" | "seconds" | "milliseconds" | "yearmonthdate")[];
export declare function getDefaultTimeRange(domain: number[], timeUnit: TimeUnit): number[] | DateTime[];
export declare function getDefaultList(timeUnit: TimeUnit): string[];
export declare function convertToDateTimeObject(timeStamp: number): DateTime;
export declare function convertToTimestamp(dateTime: DateTime): number;
export declare function filterIndexOf(filters: Array<RangeFilter | OneOfFilter>, field: string): number;
export declare function filterHasField(filters: Array<RangeFilter | OneOfFilter>, field: string): boolean;
