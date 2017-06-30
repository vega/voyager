import {FILTER_ADD, FILTER_REMOVE} from '../../actions/filter';
import {Action} from '../../actions/index';
import {DEFAULT_SHELF_UNIT_SPEC, ShelfUnitSpec} from '../../models/shelf/spec';
import {insertItemToArray, removeItemFromArray} from '../util';

export function filterReducer(shelfSpec: Readonly<ShelfUnitSpec> = DEFAULT_SHELF_UNIT_SPEC,
                              action: Action): ShelfUnitSpec {
  switch (action.type) {
    case FILTER_ADD: {
      const {filter} = action.payload;
      const filters = insertItemToArray(shelfSpec.filters, 0, filter);
      return {
        ...shelfSpec,
        filters: filters
      };
    }
    case FILTER_REMOVE: {
      const {index} = action.payload;
      const filters = removeItemFromArray(shelfSpec.filters, index).array;
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
