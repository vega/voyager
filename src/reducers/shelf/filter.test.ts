
import {FieldOneOfPredicate, FieldRangePredicate} from 'vega-lite/build/src/predicate';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {
  FILTER_ADD, FILTER_CLEAR, FILTER_MODIFY_EXTENT, FILTER_MODIFY_MAX_BOUND,
  FILTER_MODIFY_MIN_BOUND, FILTER_MODIFY_ONE_OF, FILTER_MODIFY_TIME_UNIT, FILTER_REMOVE
} from '../../actions';
import {FILTER_TOGGLE} from '../../actions/shelf/filter';
import {convertToDateTimeObject} from '../../models/shelf/filter';
import {filterReducer} from './filter';

const range = [1437978615, 1501137015];
// 1437978615: Sat Jan 17 1970 07:26:18 GMT-0800 (PST);
// 1501137015: Sun Jan 18 1970 00:58:57 GMT-0800 (PST)
const rangeFilter: FieldRangePredicate = {field: 'q1', range};
const oneOfFilter: FieldOneOfPredicate = {field: 'q2', oneOf: ['a', 'c']};
const simpleFilters: Array<FieldOneOfPredicate | FieldRangePredicate> = [rangeFilter, oneOfFilter];

describe('reducers/shelf/filter', () => {
  describe(FILTER_ADD, () => {
    it('should return a filter array containing one range filter', () => {
      const noFilters: Array<FieldOneOfPredicate | FieldRangePredicate> = [];
      const filters = filterReducer(noFilters,
        {
          type: FILTER_ADD,
          payload: {
            filter: rangeFilter,
            index: 0
          }
        });
      expect(filters).toEqual([rangeFilter]);
    });
  });

  describe(FILTER_ADD, () => {
    it('should add the given filter at the end of the array', () => {
      const rangeFilter2: FieldRangePredicate = {field: 'q3', range};
      const filters = filterReducer(simpleFilters, {
        type: FILTER_ADD,
        payload: {
          filter: rangeFilter2,
        }
      });
      expect(filters).toEqual([rangeFilter, oneOfFilter, rangeFilter2]);
    });
  });

  describe(FILTER_TOGGLE, () => {
    it('should add the given filter when toggled', () => {
      const filter = {
        field: 'q3',
        range: [0, 100]
      };
      const filters = filterReducer(simpleFilters, {
        type: FILTER_TOGGLE,
        payload: {
          filter
        }
      });
      expect(filters).toEqual([rangeFilter, oneOfFilter, filter]);
    });

    it('should remove the given filter when toggled', () => {
      const filters = filterReducer(simpleFilters, {
        type: FILTER_TOGGLE,
        payload: {
          filter: rangeFilter
        }
      });
      expect(filters).toEqual([oneOfFilter]);
    });
  });

  describe(FILTER_CLEAR, () => {
    it('should clear all filters', () => {
      const filters = filterReducer(simpleFilters, {
        type: FILTER_CLEAR
      });
      expect(filters.length).toEqual(0);
    });
  });

  describe(FILTER_REMOVE, () => {
    it('should remove the range filter at the given index and return a filter arry', () => {
      const filters = filterReducer(simpleFilters,
        {
          type: FILTER_REMOVE,
          payload: {
            index: 0
          }
        });
      expect(filters).toEqual([oneOfFilter]);
    });
  });

  describe(FILTER_MODIFY_EXTENT, () => {
    it('should modify the min bound and the max bound of the filter at the given index', () => {
      const filters = filterReducer(simpleFilters,
        {
          type: FILTER_MODIFY_EXTENT,
          payload: {
            index: 0,
            range: [100, 1000]
          }
        });
      expect(filters).toEqual([
        {field: 'q1', range: [100, 1000]}, oneOfFilter
      ]);
    });
  });

  describe(FILTER_MODIFY_MAX_BOUND, () => {
    it('should modify the max bound of the filter at the given index', () => {
      const filters = filterReducer(simpleFilters,
        {
          type: FILTER_MODIFY_MAX_BOUND,
          payload: {
            index: 0,
            maxBound: 1437978616,
          }
        });
      expect(filters).toEqual([
        {field: 'q1', range: [1437978615, 1437978616]}, oneOfFilter
      ]);
    });
  });

  describe(FILTER_MODIFY_MIN_BOUND, () => {
    it('should modify the min bound of the filter at the given index', () => {
      const filters = filterReducer(simpleFilters,
        {
          type: FILTER_MODIFY_MIN_BOUND,
          payload: {
            index: 0,
            minBound: -100,
          }
        });
      expect(filters).toEqual([
        {field: 'q1', range: [-100, 1501137015]}, oneOfFilter
      ]);
    });
  });

  describe(FILTER_MODIFY_ONE_OF, () => {
    it('should clear the oneof array of the filter at the given index', () => {
      const filters = filterReducer(simpleFilters,
        {
          type: FILTER_MODIFY_ONE_OF,
          payload: {
            index: 1,
            oneOf: []
          }
        });
      expect(filters).toEqual([
        rangeFilter, {field: 'q2', oneOf: []}
      ]);
    });
  });

  describe(FILTER_MODIFY_ONE_OF, () => {
    it('should add an item in the oneof array of the filter at the given index', () => {
      const filters = filterReducer(simpleFilters,
        {
          type: FILTER_MODIFY_ONE_OF,
          payload: {
            index: 1,
            oneOf: ['a', 'b', 'c']
          }
        });
      expect(filters).toEqual([
        rangeFilter, {field: 'q2', oneOf: ['a', 'b', 'c']}
      ]);
    });
  });


  describe(FILTER_MODIFY_TIME_UNIT, () => {
    it('should add a time unit to the range filter', () => {
      const filters = filterReducer(simpleFilters,
        {
          type: FILTER_MODIFY_TIME_UNIT,
          payload: {
            index: 0,
            domain: range,
            timeUnit: TimeUnit.YEAR
          }
        });
      expect(filters).toEqual([
        {field: 'q1', range: [1970, 1970], timeUnit: TimeUnit.YEAR}, oneOfFilter
      ]);
    });
  });

  it('should add a time unit to the one of filter', () => {
    const filters = filterReducer(simpleFilters,
      {
        type: FILTER_MODIFY_TIME_UNIT,
        payload: {
          index: 1,
          domain: range,
          timeUnit: TimeUnit.DAY
        }
      });
    expect(filters).toEqual([
      rangeFilter, {field: 'q2', oneOf: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timeUnit: TimeUnit.DAY}
    ]);
  });

  it('should remove the time unit of a filter', () => {
    const filters = filterReducer(simpleFilters,
      {
        type: FILTER_MODIFY_TIME_UNIT,
        payload: {
          index: 0,
          domain: range,
          timeUnit: undefined
        }
      });
    expect(filters).toEqual([
      {field: 'q1', range: [convertToDateTimeObject(range[0]), convertToDateTimeObject(range[1])], timeUnit: undefined},
      oneOfFilter
    ]);
  });
});
