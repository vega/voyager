import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {isWildcard} from 'compassql/build/src/wildcard';
import {DateTime} from 'vega-lite/build/src/datetime';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {convert, TimeUnit} from 'vega-lite/build/src/timeunit';
import {ShelfFieldDef} from './encoding';

export function getFilter(fieldDef: ShelfFieldDef, domain: any[]): RangeFilter | OneOfFilter {
  if (isWildcard(fieldDef.field)) {
    return;
  }
  switch (fieldDef.type) {
    case ExpandedType.QUANTITATIVE:
      return {field: fieldDef.field, range: domain};
    case ExpandedType.TEMPORAL:
      return {
        field: fieldDef.field,
        range: [convertToDateTimeObject(domain[0]), convertToDateTimeObject(domain[1])]
      };
    case ExpandedType.NOMINAL:
    case ExpandedType.ORDINAL:
    case ExpandedType.KEY:
      return {field: fieldDef.field, oneOf: domain};
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

export function getDefaultRange(domain: number[], timeUnit: TimeUnit): number[] | DateTime[] {
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
    default:
      throw new Error ('Invalid range time unit ' + timeUnit);
  }
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
