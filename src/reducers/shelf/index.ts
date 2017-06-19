import {Schema} from 'compassql/build/src/schema';

import {Action} from '../../actions';
import {Shelf} from '../../models';

import {shelfSpecReducer} from './spec';
import {shelfSpecPreviewReducer} from './spec-preview';

import {DEFAULT_SHELF_SPEC} from '../../models/shelf';

export function shelfReducer(shelf: Readonly<Shelf> = DEFAULT_SHELF_SPEC, action: Action, schema: Schema): Shelf {
  return {
    spec: shelfSpecReducer(shelf.spec, action, schema),
    specPreview: shelfSpecPreviewReducer(shelf.specPreview, action)
  };
}
