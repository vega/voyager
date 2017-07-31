import {Schema} from 'compassql/build/src/schema';

import {Action} from '../../actions';
import {Shelf} from '../../models';

import {DEFAULT_SHELF_SPEC} from '../../models/shelf';
import {shelfSpecReducer} from './spec';

export function shelfReducer(shelf: Readonly<Shelf> = DEFAULT_SHELF_SPEC, action: Action, schema: Schema): Shelf {
  const spec = shelfSpecReducer(shelf.spec, action, schema);

  if (spec !== shelf.spec) {
    // Make sure we only re-create a new object if something has changed.
    // TODO: decouple specPreview from shelf as it does not affect the compiled query.
    // TODO: once we have more query-based property here, better use some combineReducers() like function.
    // The problem is that combineReducer does not support additional parameter like `schema`
    // that we need for `shelfSpecReducer`
    return {spec};
  }
  return shelf;
}
