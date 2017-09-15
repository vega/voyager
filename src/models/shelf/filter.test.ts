
import {DateTime} from 'vega-lite/build/src/datetime';
import {
  convertToDateTimeObject,
  convertToTimestamp,
  createDefaultFilter,
  getAllTimeUnits,
  getDefaultList,
  getDefaultTimeRange
} from './filter';
import {filterHasField} from './filter';
import {toPredicateFunction} from './filter';
import {ShelfFieldDef} from './spec';

const timeStamp1 = 1437978615;
const timeStamp2 = 1501137015;
// 1437978615: Sat Jan 17 1970 07:26:18:615 GMT-0800 (PST);
// 1501137015: Sun Jan 18 1970 00:58:57:15 GMT-0800 (PST);

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
  describe('createDefaultFilter', () => {
    it('should return a range filter for quantitative field', () => {
      const fieldDef: ShelfFieldDef = {field: 'q1', type: 'quantitative'};
      const domain = [1437978615, 1501137015];
      const filter = createDefaultFilter(fieldDef, domain);
      expect(filter).toEqual({field: 'q1', range: domain});
    });

    it('should return a range filter for temporal field', () => {
      const fieldDef: ShelfFieldDef = {field: 'q1', type: 'temporal'};
      const domain = [1437978615, 1501137015];
      const filter = createDefaultFilter(fieldDef, domain);

      expect(filter).toEqual({timeUnit: 'year', field: 'q1', range: [1970, 1970]});
    });

    it('should return a oneof filter for temporal field with year', () => {
      const fieldDef: ShelfFieldDef = {fn: 'year', field: 'q1', type: 'temporal'};
      const domain = [1437978615, 1501137015];
      const filter = createDefaultFilter(fieldDef, domain);
      expect(filter).toEqual({timeUnit: 'year', field: 'q1', range: [1970, 1970]});
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

  describe('getDefaultTimeRange', () => {
    it('should return the range in year', () => {
      expect(getDefaultTimeRange([timeStamp1, timeStamp2], 'year')).toEqual([1970, 1970]);
    });

    describe('should return the range in YearMonthDate', () => {
      expect(getDefaultTimeRange([timeStamp1, timeStamp2], 'yearmonthdate')).toEqual([
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

  describe('filterHasField', () => {
    it('should return whether filters contain the given filter', () => {
      const filters = [{
        field: 'q1',
        range: [0, 100]
      }, {
        field: 'q2',
        range: [0, 1000]
      }];
      expect(filterHasField(filters, 'q1')).toEqual(true);
    });
  });

  describe('toPredicateFunction', () => {
    it('creates an expression function for a  oneOf filter', () => {
      const fn = toPredicateFunction([{field: 'a', oneOf: [1, 2]}]);
      expect(fn({a: 1})).toEqual(true);
      expect(fn({a: 3})).toEqual(false);
    });

    it('creates an expression function for a range filter', () => {
      const fn = toPredicateFunction([{field: 'a', range: [1, 2]}]);
      expect(fn({a: 1})).toEqual(true);
      expect(fn({a: 3})).toEqual(false);
    });
  });
});

