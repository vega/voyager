
import {FilterTransform} from 'vega-lite/build/src/transform';
import {ADD_ONE_OF_FILTER, ADD_RANGE_FILTER, REMOVE_ONE_OF_FILTER, REMOVE_RANGE_FILTER} from '../../actions/filter';
import {DEFAULT_SHELF_UNIT_SPEC} from '../../models/shelf';
import {ShelfUnitSpec} from '../../models/shelf/spec';
import {filterReducer} from './filter';


const rangeFilterTransform: FilterTransform = {filter: {field: 'q1', range: [0, 1]}};
const oneOfFilterTransform: FilterTransform = {filter: {field: 'q2', oneOf: ['a', 'c']}};

const noFilterSpec: ShelfUnitSpec = {
  ...DEFAULT_SHELF_UNIT_SPEC,
  filters: []
};

const simpleSpec: ShelfUnitSpec = {
  ...DEFAULT_SHELF_UNIT_SPEC,
  filters: [rangeFilterTransform, oneOfFilterTransform]
};

describe('reducers/shelf/filter', () => {
  describe(ADD_RANGE_FILTER, () => {
    it('should return filter array containing one range filter', () => {
      const spec: ShelfUnitSpec = filterReducer(noFilterSpec,
        {
          type: ADD_RANGE_FILTER,
          payload: {filter: rangeFilterTransform}
        });
      expect(spec.filters).toEqual([rangeFilterTransform]);
    });
  });

  describe(REMOVE_RANGE_FILTER, () => {
    it('should remove the given range filter', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: REMOVE_RANGE_FILTER,
          payload: {filter: rangeFilterTransform}
        });
      expect(spec.filters).toEqual([oneOfFilterTransform]);
    });
  });

  describe(ADD_ONE_OF_FILTER, () => {
    it('should only return data with values in the given array', () => {
      const spec: ShelfUnitSpec = filterReducer(noFilterSpec,
        {
          type: ADD_ONE_OF_FILTER,
          payload: {filter: oneOfFilterTransform}
        });
      expect(spec.filters).toEqual([oneOfFilterTransform]);
    });
  });

  describe(REMOVE_ONE_OF_FILTER, () => {
    it('should remove the given oneOfFilter', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: REMOVE_ONE_OF_FILTER,
          payload: {filter: oneOfFilterTransform}
        });
      expect(spec.filters).toEqual([rangeFilterTransform]);
    });
  });
});
