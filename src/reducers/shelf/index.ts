
import {fromSpec} from 'compassql/build/src/query/spec';
import {isWildcard, SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import * as stringify from 'json-stable-stringify';
import {combineReducers} from 'redux';
import {Action} from '../../actions';
import {SHELF_AUTO_ADD_COUNT_CHANGE, SHELF_GROUP_BY_CHANGE, SHELF_LOAD_QUERY} from '../../actions/shelf/index';
import {SPEC_LOAD} from '../../actions/shelf/spec';
import {Shelf} from '../../models';
import {DEFAULT_SHELF} from '../../models/shelf';
import {fromTransforms} from '../../models/shelf/filter';
import {getDefaultGroupBy, isShelfGroupBy, ShelfGroupBy} from '../../models/shelf/index';
import {fromSpecQuery, hasWildcards} from '../../models/shelf/spec/index';
import {filterReducer} from './filter';
import {shelfSpecReducer} from './spec';

function groupByReducer(state: Readonly<ShelfGroupBy> = DEFAULT_SHELF.groupBy, action: Action) {
  switch (action.type) {
    case SHELF_GROUP_BY_CHANGE:
      const {groupBy} = action.payload;
      return groupBy;
  }
  return state;
}

function autoAddCountReducer(state: Readonly<boolean> = DEFAULT_SHELF.autoAddCount, action: Action) {
  switch (action.type) {
    case SHELF_AUTO_ADD_COUNT_CHANGE:
      const {autoAddCount} = action.payload;
      return autoAddCount;
  }
  return state;
}

const shelfReducerBase = combineReducers<Shelf>({
  spec: shelfSpecReducer,
  autoAddCount: autoAddCountReducer,
  groupBy: groupByReducer,
  filters: filterReducer
});

export function shelfReducer(shelf: Readonly<Shelf> = DEFAULT_SHELF, action: Action): Shelf {
  switch (action.type) {
    case SHELF_LOAD_QUERY: {
      const {query} = action.payload;

      const spec = fromSpecQuery(query.spec, shelf.spec.config);

      // If the groupBy is equivalent to "auto", let's set to auto for more flexibility.
      const defaultGroupBy = getDefaultGroupBy(hasWildcards(query.spec));
      const groupBy = query.groupBy === defaultGroupBy ? 'auto' : query.groupBy;

      const {autoAddCount} = query.config || {autoAddCount: false};

      /* istanbul ignore else: it should reach else */
      if (isShelfGroupBy(groupBy)) {
        return {
          ...shelf,
          spec,
          groupBy,
          ...(autoAddCount ? {autoAddCount} : {})
          // TODO: load other query components too, once we have them in the model
        };
      } else {
        throw new Error(`SHELF_LOAD_QUERY does not support groupBy ${JSON.stringify(groupBy)}`);
      }
    }

    case SPEC_LOAD:
      const {keepWildcardMark} = action.payload;
      const {transform, ...specWithoutTransform} = action.payload.spec;

      const specQ = {
        ...fromSpec(specWithoutTransform),

        // Restore wildcard mark if the shelf previously has wildcard mark.
        // and keepWildcardMark is true
        ...(keepWildcardMark && isWildcard(shelf.spec.mark) ? {
          mark: SHORT_WILDCARD
        } : {})
      };

      const spec = fromSpecQuery(specQ, shelf.spec.config);

      const newFilters = fromTransforms(transform);
      const filters = stringify(newFilters) !== stringify(shelf.filters) ?
        // Use newFilters only if it is different
        newFilters : shelf.filters;

      return {...DEFAULT_SHELF, spec, filters};
  }

  return shelfReducerBase(shelf, action);
}
