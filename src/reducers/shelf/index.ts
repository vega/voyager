import {Schema} from 'compassql/build/src/schema';

import {Action} from '../../actions';
import {Shelf} from '../../models';

import {shelfSpecReducer} from './spec';
import {shelfSpecPreviewReducer} from './spec-preview';

export function shelfReducer(shelf: Readonly<Shelf>, action: Action, schema: Schema): Shelf {
  return {
    spec: shelfSpecReducer(shelf.spec, action, schema),
    specPreview: shelfSpecPreviewReducer(shelf.specPreview, action)
  };
}
