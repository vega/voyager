
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {
  FILTER_ADD, FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND, FILTER_MODIFY_ONE_OF, FILTER_REMOVE
} from '../../actions/filter';
import {DEFAULT_SHELF_UNIT_SPEC} from '../../models/shelf';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {ShelfUnitSpec} from '../../models/shelf/spec';
import {filterReducer, getFilter} from './filter';

const rangeFilter: RangeFilter = {field: 'q1', range: [0, 1]};
const oneOfFilter: OneOfFilter = {field: 'q2', oneOf: ['a', 'c']};
const rangeFilter2: RangeFilter = {field: 'q3', range: [0, 1]};

const noFilterSpec: ShelfUnitSpec = {
  ...DEFAULT_SHELF_UNIT_SPEC,
  filters: []
};

const simpleSpec: ShelfUnitSpec = {
  ...DEFAULT_SHELF_UNIT_SPEC,
  filters: [rangeFilter, oneOfFilter]
};

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
        });
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
      });
      expect(spec.filters).toEqual([rangeFilter, oneOfFilter, rangeFilter2]);
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
        });
      expect(spec.filters).toEqual([oneOfFilter]);
    });
  });

  describe(FILTER_MODIFY_MAX_BOUND, () => {
    it('should modify the max bound of the filter at the given index', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: FILTER_MODIFY_MAX_BOUND,
          payload: {
            index: 0,
            maxBound: 100,
          }
        });
      expect(spec.filters).toEqual([
        {field: 'q1', range: [0, 100]}, oneOfFilter
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
        });
      expect(spec.filters).toEqual([
        {field: 'q1', range: [-100, 1]}, oneOfFilter
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
        });
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
        });
      expect(spec.filters).toEqual([
        rangeFilter, {field: 'q2', oneOf: ['a', 'b', 'c']}
      ]);
    });
  });

  describe('getFilter', () => {
    it('should return an range filter', () => {
      const fieldDef: ShelfFieldDef = {field: 'q1', type: 'quantitative'};
      const domain: any[] = [0, 1];
      const filter = getFilter(fieldDef, domain);
      expect(filter).toEqual(rangeFilter);
    });
  });
});
