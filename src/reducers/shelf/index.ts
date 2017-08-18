import {Schema} from 'compassql/build/src/schema';

import {Action} from '../../actions';
import {Shelf} from '../../models';

import {SHELF_AUTO_ADD_COUNT_CHANGE, SHELF_LOAD_QUERY} from '../../actions/shelf/index';
import {DEFAULT_SHELF} from '../../models/shelf';
import {fromSpecQuery} from '../../models/shelf/spec/index';
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

    case SHELF_LOAD_QUERY: {
      const {query} = action.payload;
      const {autoAddCount} = query.config || {autoAddCount: false};
      return {
        ...shelf,
        spec: fromSpecQuery(query.spec, shelf.spec.config),
        ...(autoAddCount ? {autoAddCount} : {})
        // TODO: load other query components too, once we have them in the model
      };
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

