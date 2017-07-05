
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {FILTER_ADD, FILTER_MODIFY, FILTER_REMOVE} from '../../actions/filter';
import {DEFAULT_SHELF_UNIT_SPEC} from '../../models/shelf';
import {ShelfUnitSpec} from '../../models/shelf/spec';
import {insertItemToArray} from '../util';
import {filterReducer} from './filter';

const rangeFilter: RangeFilter = {field: 'q1', range: [0, 1]};
const oneOfFilter: OneOfFilter = {field: 'q2', oneOf: ['a', 'c']};

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

  describe(FILTER_MODIFY, () => {
    it('should modify the range of the filter at the given index', () => {

      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: FILTER_MODIFY,
          payload: {
            index: 1,
            modifier: (filter: OneOfFilter) => {
              return {
                ...filter,
                oneOf: insertItemToArray(filter.oneOf as string[], 1, 'b')
              };
            }
          }
        });
      expect(spec.filters).toEqual([rangeFilter, {
        field: 'q2', oneOf: ['a', 'b', 'c']
      }]);
    });
  });
});
