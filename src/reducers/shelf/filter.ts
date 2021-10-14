
import {FieldOneOfPredicate, FieldRangePredicate} from 'vega-lite/build/src/predicate';
import {TimeUnit} from 'vega-lite/build/src/timeunit';
import {
  FILTER_ADD, FILTER_CLEAR, FILTER_MODIFY_EXTENT, FILTER_MODIFY_MAX_BOUND, FILTER_MODIFY_MIN_BOUND,
  FILTER_MODIFY_ONE_OF, FILTER_MODIFY_TIME_UNIT, FILTER_REMOVE, FILTER_TOGGLE
} from '../../actions';
import {Action} from '../../actions/index';
import {filterIndexOf, getDefaultList, getDefaultTimeRange, ShelfFilter} from '../../models/shelf/filter';
import {insertItemToArray, modifyItemInArray, removeItemFromArray} from '../util';


export function filterReducer(
  filters: Array<FieldRangePredicate | FieldOneOfPredicate> = [],
  action: Action
): Array<FieldRangePredicate | FieldOneOfPredicate> {
  switch (action.type) {
    case FILTER_ADD: {
      const {filter} = action.payload;
      let index = action.payload.index;
      if (!index) {
        index = filters.length;
      }
      return insertItemToArray(filters, index, filter);
    }

    case FILTER_CLEAR: {
      return [];
    }

    case FILTER_REMOVE: {
      const {index} = action.payload;
      return removeItemFromArray(filters, index).array;
    }

    case FILTER_TOGGLE: {
      const {filter} = action.payload;
      const index = filterIndexOf(filters, filter.field);
      if (index === -1) {
        // add filter
        return insertItemToArray(filters, filters.length, filter);
      } else {
        return removeItemFromArray(filters, index).array;
      }
    }

    case FILTER_MODIFY_EXTENT: {
      const {index, range} = action.payload;
      const modifyExtent = (filter: FieldRangePredicate) => {
        return {
          ...filter,
          range
        };
      };
      return modifyItemInArray(filters, index, modifyExtent);
    }

    case FILTER_MODIFY_MAX_BOUND: {
      const {index, maxBound} = action.payload;
      const modifyMaxBound = (filter: FieldRangePredicate) => {
        return {
          ...filter,
          range: [filter.range[0], maxBound]
        };
      };
      return modifyItemInArray(filters, index, modifyMaxBound);
    }

    case FILTER_MODIFY_MIN_BOUND: {
      const {index, minBound} = action.payload;
      const modifyMinBound = (filter: FieldRangePredicate) => {
        return {
          ...filter,
          range: [minBound, filter.range[1]]
        };
      };
      return modifyItemInArray(filters, index, modifyMinBound);
    }

    case FILTER_MODIFY_ONE_OF: {
      const {index, oneOf} = action.payload;
      const modifyOneOf = (filter: FieldOneOfPredicate) => {
        return {
          ...filter,
          oneOf: oneOf
        };
      };
      return modifyItemInArray(filters, index, modifyOneOf);
    }

    case FILTER_MODIFY_TIME_UNIT: {
      const {index, timeUnit, domain} = action.payload;
      return modifyItemInArray(filters, index, getModifyTimeUnitFunction(timeUnit, domain));
    }

    default: {
      return filters;
    }
  }
}

function getModifyTimeUnitFunction(timeUnit: TimeUnit, domain: number[]) {
  if (timeUnit === TimeUnit.MONTH || timeUnit === TimeUnit.DAY) {
    return (filter: ShelfFilter): FieldOneOfPredicate => {
      return {
        field: filter.field,
        timeUnit,
        oneOf: getDefaultList(timeUnit)
      };
    };
  } else {
    return (filter: ShelfFilter): FieldRangePredicate => {
      return {
        field: filter.field,
        ...timeUnit ? {timeUnit} : {},
        range: getDefaultTimeRange(domain, timeUnit)
      };
    };
  }
}
