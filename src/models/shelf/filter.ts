import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {isWildcard} from 'compassql/build/src/wildcard';
import * as vegaExpression from 'vega-expression';
import {DateTime} from 'vega-lite/build/src/datetime';
import {
  fieldFilterExpression,
  FieldOneOfPredicate,
  FieldRangePredicate,
  isFieldOneOfPredicate,
  isFieldRangePredicate
} from 'vega-lite/build/src/predicate';
import {convert, isTimeUnit, TimeUnit} from 'vega-lite/build/src/timeunit';
import {isFilter, Transform} from 'vega-lite/build/src/transform';
import {ShelfFieldDef} from './spec';

export type ShelfFilter = FieldRangePredicate | FieldOneOfPredicate;

export function fromTransforms(transforms: Transform[]): ShelfFilter[] {
  if (!transforms) {
    return [];
  } else {
    return transforms.map(transform => {
      if (!isFilter(transform)) {
        throw new Error('Voyager does not support transforms other than FilterTransform');
      } else if (!isFieldRangePredicate(transform.filter) && !isFieldOneOfPredicate(transform.filter)) {
        throw new Error('Voyager does not support filters other than RangeFilter and OneOfFilter');
      }
      return transform.filter;
    });
  }
}

export function toTransforms(filters: Array<FieldRangePredicate|FieldOneOfPredicate>) {
  return filters.map(filter => ({filter}));
}

/**
 * Return a dataflow expression function for a given array of filter.
 * Following example code from https://github.com/uwdata/dataflow-api/blob/master/test/filter-test.js
 */
export function toPredicateFunction(filters: ShelfFilter[]) {
  const expr = '(' +
    filters.map(f => {
      return fieldFilterExpression(f, false); // Do not use inrange as it is not included in the main Vega Expression
    }).join(')&&(') +
  ')';
  const ast = vegaExpression.parse(expr);
  const codegen = vegaExpression.codegen({
    whitelist: ['datum'],
    globalvar: 'global'
  });
  const value = codegen(ast);

  return new Function('datum', `return ${value.code};`) as (d: object) => boolean;
}

export function createDefaultFilter(fieldDef: ShelfFieldDef, domain: any[]): FieldRangePredicate | FieldOneOfPredicate {
  const {field, type, fn} = fieldDef;
  if (isWildcard(field)) {
    return;
  }
  switch (type) {
    case ExpandedType.QUANTITATIVE:
      return {field, range: domain};
    case ExpandedType.TEMPORAL:
      // TODO: consider if we want to change default time unit?
      const timeUnit = !isWildcard(fn) && isTimeUnit(fn) ? fn : 'year';
      return {
        timeUnit,
        field,
        range: getDefaultTimeRange(domain, timeUnit)
      };
    case ExpandedType.NOMINAL:
    case ExpandedType.ORDINAL:
    case ExpandedType.KEY:
      return {field, oneOf: domain};
    default:
      throw new Error('Unsupported type ' + fieldDef.type);
  }
}

export function getAllTimeUnits() {
  return [
    TimeUnit.YEARMONTHDATE,
    TimeUnit.YEAR,
    TimeUnit.MONTH,
    TimeUnit.QUARTER,
    TimeUnit.DATE,
    TimeUnit.DAY,
    TimeUnit.HOURS,
    TimeUnit.MINUTES,
    TimeUnit.SECONDS,
    TimeUnit.MILLISECONDS
  ];
}

export function getDefaultTimeRange(domain: number[], timeUnit: TimeUnit): number[] | DateTime[] {
  switch (timeUnit) {
    case TimeUnit.YEARMONTHDATE:
      return [convertToDateTimeObject(Number(convert(timeUnit, new Date(domain[0])))),
        convertToDateTimeObject(Number(convert(timeUnit, new Date(domain[1]))))];
    case TimeUnit.YEAR:
      return [convert(timeUnit, new Date(domain[0])).getFullYear(),
        convert(timeUnit, new Date(domain[1])).getFullYear()];
    case TimeUnit.QUARTER:
      return [1, 4];
    case TimeUnit.DATE:
      return [1, 31];
    case TimeUnit.HOURS:
      return [0, 23];
    case TimeUnit.MINUTES:
      return [0, 59];
    case TimeUnit.SECONDS:
      return [0, 59];
    case TimeUnit.MILLISECONDS:
      return [0, 999];
    case undefined:
      return [convertToDateTimeObject(Number(domain[0])), convertToDateTimeObject(Number(domain[1]))];
  }
  throw new Error ('Cannot determine range for unsupported time unit ' + timeUnit);
}

export function getDefaultList(timeUnit: TimeUnit): string[] {
  switch (timeUnit) {
    case TimeUnit.MONTH:
      return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'];
    case TimeUnit.DAY:
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    default:
      throw new Error ('Invalid time unit ' + timeUnit);
  }
}

export function convertToDateTimeObject(timeStamp: number): DateTime {
  const date = new Date(timeStamp);
  return {
    year: date.getFullYear(),
    quarter: Math.floor((date.getMonth() + 3) / 3),
    month: date.getMonth() + 1, // 1-indexing
    date: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    milliseconds: date.getMilliseconds(),
    utc: date.getTimezoneOffset() === 0
  };
}

export function convertToTimestamp(dateTime: DateTime): number {
  const date = new Date(
    dateTime.year,
    Number(dateTime.month) - 1, // 0-indexing
    dateTime.date,
    dateTime.hours,
    dateTime.minutes,
    dateTime.seconds,
    dateTime.milliseconds
  );
  return Number(date);
}

export function filterIndexOf(filters: Array<FieldRangePredicate | FieldOneOfPredicate>, field: string) {
  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i];
    if (filter.field === field) {
      return i;
    }
  }
  return -1;
}

export function filterHasField(filters: Array<FieldRangePredicate | FieldOneOfPredicate>, field: string) {
  return filterIndexOf(filters, field) >= 0;
}
