
import {Schema} from 'compassql/build/src/schema';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {
  FILTER_ADD, FILTER_CLEAR, FILTER_MODIFY_EXTENT, FILTER_MODIFY_MAX_BOUND,
  FILTER_MODIFY_MIN_BOUND, FILTER_MODIFY_ONE_OF, FILTER_MODIFY_TIME_UNIT, FILTER_REMOVE
} from '../../actions/filter';
import {DEFAULT_SHELF_UNIT_SPEC} from '../../models/shelf';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {ShelfUnitSpec} from '../../models/shelf/spec';
import {filterReducer, getFilter} from './filter';

const rangeFilter: RangeFilter = {field: 'q1', range: [1437978615, 1501137015]};
// 1437978615: Sat Jan 17 1970 07:26:18 GMT-0800 (PST);
// 1501137015: Sun Jan 18 1970 00:58:57 GMT-0800 (PST)
const oneOfFilter: OneOfFilter = {field: 'q2', oneOf: ['a', 'c']};
const rangeFilter2: RangeFilter = {field: 'q3', range: [1437978615, 1501137015]};

const noFilterSpec: ShelfUnitSpec = {
  ...DEFAULT_SHELF_UNIT_SPEC,
  filters: []
};

const simpleSpec: ShelfUnitSpec = {
  ...DEFAULT_SHELF_UNIT_SPEC,
  filters: [rangeFilter, oneOfFilter]
};

const schema = new Schema({fields: [
  {
    name: 'q1',
    vlType: 'temporal',
    type: 'datetime' as any,
    stats: {
      distinct: 2,
      max: 1501137015,
      min: 1437978615
    } as DLFieldProfile
  },
  {
    name: 'q2',
    vlType: 'nominal',
    type: 'string' as any,
    stats: {
      distinct: 2
    } as DLFieldProfile
  }
]});
describe('reducers/shelf/filter', () => {
  describe(FILTER_ADD, () => {
    it('should return a filter array containing one range filter', () => {
      const spec: ShelfUnitSpec = filterReducer(noFilterSpec,
        {
          type: FILTER_ADD,
          payload: {
            filter: rangeFilter,
            index: 0
          }
        }, schema);
      expect(spec.filters).toEqual([rangeFilter]);
    });
  });

  describe(FILTER_ADD, () => {
    it('should add the given filter at the end of the array', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec, {
        type: FILTER_ADD,
        payload: {
          filter: rangeFilter2,
        }
      }, schema);
      expect(spec.filters).toEqual([rangeFilter, oneOfFilter, rangeFilter2]);
    });
  });

  describe(FILTER_CLEAR, () => {
    it('should clear all filters', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec, {
        type: FILTER_CLEAR
      }, schema);
      expect(spec.filters.length).toEqual(0);
    });
  });

  describe(FILTER_REMOVE, () => {
    it('should remove the range filter at the given index and return a filter arry', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: FILTER_REMOVE,
          payload: {
            index: 0
          }
        }, schema);
      expect(spec.filters).toEqual([oneOfFilter]);
    });
  });

  describe(FILTER_MODIFY_EXTENT, () => {
    it('should modify the min bound and the max bound of the filter at the given index', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: FILTER_MODIFY_EXTENT,
          payload: {
            index: 0,
            range: [100, 1000]
          }
        }, schema);
      expect(spec.filters).toEqual([
        {field: 'q1', range: [100, 1000]}, oneOfFilter
      ]);
    });
  });

  describe(FILTER_MODIFY_MAX_BOUND, () => {
    it('should modify the max bound of the filter at the given index', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: FILTER_MODIFY_MAX_BOUND,
          payload: {
            index: 0,
            maxBound: 1437978616,
          }
        }, schema);
      expect(spec.filters).toEqual([
        {field: 'q1', range: [1437978615, 1437978616]}, oneOfFilter
      ]);
    });
  });

  describe(FILTER_MODIFY_MIN_BOUND, () => {
    it('should modify the min bound of the filter at the given index', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: FILTER_MODIFY_MIN_BOUND,
          payload: {
            index: 0,
            minBound: -100,
          }
        }, schema);
      expect(spec.filters).toEqual([
        {field: 'q1', range: [-100, 1501137015]}, oneOfFilter
      ]);
    });
  });

  describe(FILTER_MODIFY_ONE_OF, () => {
    it('should clear the oneof array of the filter at the given index', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: FILTER_MODIFY_ONE_OF,
          payload: {
            index: 1,
            oneOf: []
          }
        }, schema);
      expect(spec.filters).toEqual([
        rangeFilter, {field: 'q2', oneOf: []}
      ]);
    });
  });

  describe(FILTER_MODIFY_ONE_OF, () => {
    it('should add an item in the oneof array of the filter at the given index', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: FILTER_MODIFY_ONE_OF,
          payload: {
            index: 1,
            oneOf: ['a', 'b', 'c']
          }
        }, schema);
      expect(spec.filters).toEqual([
        rangeFilter, {field: 'q2', oneOf: ['a', 'b', 'c']}
      ]);
    });
  });

  describe('getFilter', () => {
    it('should return a range filter', () => {
      const fieldDef: ShelfFieldDef = {field: 'q1', type: 'quantitative'};
      const domain: any[] = [1437978615, 1501137015];
      const filter = getFilter(fieldDef, domain);
      expect(filter).toEqual(rangeFilter);
    });
  });

  describe(FILTER_MODIFY_TIME_UNIT, () => {
    it('should add a time unit to the range filter', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: FILTER_MODIFY_TIME_UNIT,
          payload: {
            index: 0,
            timeUnit: TimeUnit.YEAR
          }
        }, schema);
      expect(spec.filters).toEqual([
        {field: 'q1', range: [1970, 1970], timeUnit: TimeUnit.YEAR}, oneOfFilter
      ]);
    });
  });

  it('should add a time unit to the one of filter', () => {
    const spec: ShelfUnitSpec = filterReducer(simpleSpec,
      {
        type: FILTER_MODIFY_TIME_UNIT,
        payload: {
          index: 1,
          timeUnit: TimeUnit.DAY
        }
      }, schema);
    expect(spec.filters).toEqual([
      rangeFilter, {field: 'q2', oneOf: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        timeUnit: TimeUnit.DAY}
    ]);
  });
});
