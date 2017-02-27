import {Action} from '../../actions';
import {Shelf} from '../../models';

import {shelfSpecReducer} from './spec';

export function shelfReducer(shelf: Readonly<Shelf>, action: Action): Shelf {
  return {
    spec: shelfSpecReducer(shelf.spec, action)
  };
}
