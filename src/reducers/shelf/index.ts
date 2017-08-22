import {Schema} from 'compassql/build/src/schema';
import {Action} from '../../actions';
import {SHELF_AUTO_ADD_COUNT_CHANGE, SHELF_GROUP_BY_CHANGE, SHELF_LOAD_QUERY} from '../../actions/shelf/index';
import {Shelf} from '../../models';
import {DEFAULT_SHELF} from '../../models/shelf';
import {getDefaultGroupBy, isShelfGroupBy} from '../../models/shelf/index';
import {fromSpecQuery, hasWildcards} from '../../models/shelf/spec/index';
import {shelfSpecReducer} from './spec';

export function shelfReducer(shelf: Readonly<Shelf> = DEFAULT_SHELF, action: Action, schema: Schema): Shelf {
  switch (action.type) {
    case SHELF_AUTO_ADD_COUNT_CHANGE: {
      const {autoAddCount} = action.payload;
      return {
        ...shelf,
        autoAddCount
      };
    }

    case SHELF_GROUP_BY_CHANGE: {
      const {groupBy} = action.payload;
      return {
        ...shelf,
        groupBy
      };
    }

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
  }

  const spec = shelfSpecReducer(shelf.spec, action, schema);
  if (spec !== shelf.spec) {
    // Make sure we only re-create a new object if something has changed.
    // TODO: once we have more query-based property here, better use some combineReducers() like function.
    // The problem is that combineReducer does not support additional parameter like `schema`
    // that we need for `shelfSpecReducer`
    return {
      ...shelf,
      spec
    };
  }
  return shelf;
}
