import {DateTime} from 'vega-lite/build/src/datetime';
import {RangeFilter} from 'vega-lite/build/src/filter';
import {
  convertToDateTimeObject,
  convertToTimestamp,
  getAllTimeUnits,
  getDefaultList,
  getDefaultRange,
  getFilter
} from './filter';
import {ShelfFieldDef} from './spec';

const timeStamp1 = 1437978615;
const timeStamp2 = 1501137015;
// 1437978615: Sat Jan 17 1970 07:26:18:615 GMT-0800 (PST);
// 1501137015: Sun Jan 18 1970 00:58:57:15 GMT-0800 (PST);

const rangeFilter: RangeFilter = {field: 'q1', range: [timeStamp1, timeStamp2]};

const dateTime1: DateTime = {
  year: 1970,
  quarter: 1,
  month: 1,
  date: 17,
  hours: 7,
  minutes: 26,
  seconds: 18,
  milliseconds: 615,
  utc: false
};
const dateTime2: DateTime = {
  year: 1970,
  quarter: 1,
  month: 1,
  date: 18,
  hours: 0,
  minutes: 58,
  seconds: 57,
  milliseconds: 15,
  utc: false
};

describe('models/shelf/filter', () => {
  describe('getFilter', () => {
    it('should return a range filter', () => {
      const fieldDef: ShelfFieldDef = {field: 'q1', type: 'quantitative'};
      const domain: any[] = [1437978615, 1501137015];
      const filter = getFilter(fieldDef, domain);
      expect(filter).toEqual(rangeFilter);
    });
  });

  describe('getAllTimeUnits', () => {
    it('should return all supported time unit', () => {
      expect(getAllTimeUnits().sort()).toEqual([
        'year', 'yearmonthdate', 'quarter', 'month', 'date', 'day', 'hours',
        'minutes', 'seconds', 'milliseconds'
      ].sort());
    });
  });

  describe('getDefaultRange', () => {
    it('should return the range in year', () => {
      expect(getDefaultRange([timeStamp1, timeStamp2], 'year')).toEqual([1970, 1970]);
    });

    describe('should return the range in YearMonthDate', () => {
      expect(getDefaultRange([timeStamp1, timeStamp2], 'yearmonthdate')).toEqual([
        {
          year: 1970,
          quarter: 1,
          month: 1,
          date: 17,
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
          utc: false
        },
        {
          year: 1970,
          quarter: 1,
          month: 1,
          date: 18,
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
          utc: false
        }
      ]);
    });
  });

  describe('getDefaultList', () => {
    it('should return 7 days in the list', () => {
      expect(getDefaultList('day')).toEqual([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ]);
    });
  });

  describe('convertToDateTimeObject', () => {
    it('should return a dateTime object of the given timeStamp', () => {
      expect(convertToDateTimeObject(timeStamp1)).toEqual(dateTime1);
    });
  });

  describe('convertToTimestamp', () => {
    it('should return a timestamp of the given dateTime object', () => {
      expect(convertToTimestamp(dateTime2)).toEqual(timeStamp2);
    });
  });
});

