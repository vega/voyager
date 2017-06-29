
import {ADD_ONE_OF_FILTER, ADD_RANGE_FILTER, REMOVE_ONE_OF_FILTER, REMOVE_RANGE_FILTER} from '../../actions/filter';
import {Action} from '../../actions/index';
import {DEFAULT_SHELF_UNIT_SPEC, ShelfUnitSpec} from '../../models/shelf/spec';
import {insertItemToArray, removeItemFromArray} from './spec';

export function filterReducer(shelfSpec: Readonly<ShelfUnitSpec> = DEFAULT_SHELF_UNIT_SPEC,
                              action: Action): ShelfUnitSpec {
  switch (action.type) {
    case ADD_RANGE_FILTER: {
      const {filter} = action.payload;
      const filters = insertItemToArray(shelfSpec.filters, 0, filter);
      return {
        ...shelfSpec,
        filters: filters
      };
    }
    case ADD_ONE_OF_FILTER: {
      const {filter} = action.payload;
      const filters = insertItemToArray(shelfSpec.filters, 0, filter);
      return {
        ...shelfSpec,
        filters: filters
      };
    }
    case REMOVE_RANGE_FILTER: {
      const {filter} = action.payload;
      const filters = removeItemFromArray(shelfSpec.filters, shelfSpec.filters.indexOf(filter)).array;
      return {
        ...shelfSpec,
        filters: filters
      };
    }
    case REMOVE_ONE_OF_FILTER: {
      const {filter} = action.payload;
      const filters = removeItemFromArray(shelfSpec.filters
      , shelfSpec.filters.indexOf(filter)).array;
      return {
        ...shelfSpec,
        filters: filters
      };
    }
    default: {
      return shelfSpec;
    }
  }
}
