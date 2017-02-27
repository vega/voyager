import {Shelf, StateBase} from '../../models';
import {Action} from '../../actions';

import {shelfSpecReducer} from './spec';

export function shelfReducer(shelf: Readonly<Shelf>, action: Action): Shelf {
  return {
    spec: shelfSpecReducer(shelf.spec, action)
  };
}
