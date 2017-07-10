import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {
  FILTER_ADD, FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND, FILTER_MODIFY_ONE_OF, FILTER_REMOVE
} from '../../actions/filter';
import {Action} from '../../actions/index';
import {ShelfFieldDef} from '../../models/shelf/encoding';
import {DEFAULT_SHELF_UNIT_SPEC, ShelfUnitSpec} from '../../models/shelf/spec';
import {insertItemToArray, modifyItemInArray, removeItemFromArray} from '../util';



export function filterReducer(shelfSpec: Readonly<ShelfUnitSpec> = DEFAULT_SHELF_UNIT_SPEC,
                              action: Action): ShelfUnitSpec {
  switch (action.type) {
    case FILTER_ADD: {
      const {filter} = action.payload;
      let index = action.payload.index;
      if (!index) {
        index = shelfSpec.filters.length;
      }
      const filters = insertItemToArray(shelfSpec.filters, index, filter);
      return {
        ...shelfSpec,
        filters
      };
    }
    case FILTER_REMOVE: {
      const {index} = action.payload;
      const filters = removeItemFromArray(shelfSpec.filters, index).array;
      return {
        ...shelfSpec,
        filters
      };
    }
    case FILTER_MODIFY_MAX_BOUND: {
      const {index, maxBound} = action.payload;
      const modifier = (filter: RangeFilter) => {
        return {
          ...filter,
          range: [filter.range[0], maxBound]
        };
      };
      const filters = modifyItemInArray(shelfSpec.filters, index, modifier);
      return {
        ...shelfSpec,
        filters
      };
    }
    case FILTER_MODIFY_MIN_BOUND: {
      const {index, minBound} = action.payload;
      const modifier = (filter: RangeFilter) => {
        return {
          ...filter,
          range: [minBound, filter.range[filter.range.length - 1]]
        };
      };
      const filters = modifyItemInArray(shelfSpec.filters, index, modifier);
      return {
        ...shelfSpec,
        filters
      };
    }
    case FILTER_MODIFY_ONE_OF: {
      const {index, oneOf} = action.payload;
      const modifier = (filter: OneOfFilter) => {
        return {
          ...filter,
          oneOf: oneOf
        };
      };
      const filters = modifyItemInArray(shelfSpec.filters, index, modifier);
      return {
        ...shelfSpec,
        filters
      };
    }
    default: {
      return shelfSpec;
    }
  }
}

export function getFilter(fieldDef: ShelfFieldDef, domain: any[]) {
  if (typeof fieldDef.field !== 'string') {
    return;
  }
  switch (fieldDef.type) {
    case ExpandedType.QUANTITATIVE:
    case ExpandedType.TEMPORAL:
      return {field: fieldDef.field, range: domain};
    case ExpandedType.NOMINAL:
    case ExpandedType.ORDINAL:
    case ExpandedType.KEY:
      return {field: fieldDef.field, oneOf: domain};
    default:
      throw new Error('Unsupported type ' + fieldDef.type);
  }
}
