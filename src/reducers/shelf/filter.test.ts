
import {FilterTransform} from 'vega-lite/build/src/transform';
import {FILTER_ADD, FILTER_REMOVE} from '../../actions/filter';
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
  describe(FILTER_ADD, () => {
    it('should return a filterTransform array containing one range filter', () => {
      const spec: ShelfUnitSpec = filterReducer(noFilterSpec,
        {
          type: FILTER_ADD,
          payload: {filter: rangeFilterTransform}
        });
      expect(spec.filters).toEqual([rangeFilterTransform]);
    });
  });

  describe(FILTER_REMOVE, () => {
    it('should remove the range filter at the given index and return a filterTransform arry', () => {
      const spec: ShelfUnitSpec = filterReducer(simpleSpec,
        {
          type: FILTER_REMOVE,
          payload: {
            index: 0
          }
        });
      expect(spec.filters).toEqual([oneOfFilterTransform]);
    });
  });
});
