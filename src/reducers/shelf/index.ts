import {Schema} from 'compassql/build/src/schema';

import {Action} from '../../actions';
import {Shelf} from '../../models';

import {shelfSpecReducer} from './spec';

export function shelfReducer(shelf: Readonly<Shelf>, action: Action, schema: Schema): Shelf {
  return {
    spec: shelfSpecReducer(shelf.spec, action, schema)
  };
}
