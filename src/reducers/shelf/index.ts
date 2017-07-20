import {Schema} from 'compassql/build/src/schema';

import {Action} from '../../actions';
import {Shelf} from '../../models';
import {DEFAULT_SHELF_SPEC} from '../../models/shelf';
import {Logger} from '../../models/shelf/logger';
import {shelfSpecReducer} from './spec';
import {shelfSpecPreviewReducer} from './spec-preview';

export function shelfReducer(shelf: Readonly<Shelf> = DEFAULT_SHELF_SPEC, action: Action, schema: Schema): Shelf {
  return {
    spec: shelfSpecReducer(shelf.spec, action, schema),
    specPreview: shelfSpecPreviewReducer(shelf.specPreview, action),
    logger: new Logger()
  };
}
