import {fromSpec} from 'compassql/build/src/query/spec';
import {Action} from '../actions/index';
import {SHELF_PREVIEW_DISABLE, SHELF_PREVIEW_QUERY, SHELF_PREVIEW_SPEC} from '../actions/shelf-preview';
import {SHELF_LOAD_QUERY} from '../actions/shelf/index';
import {SPEC_LOAD} from '../actions/shelf/spec';
import {DEFAULT_SHELF_PREVIEW, ShelfPreview} from '../models/shelf-preview';
import {fromSpecQuery} from '../models/shelf/spec';


export function shelfPreviewReducer(preview: ShelfPreview = DEFAULT_SHELF_PREVIEW,
                                    action: Action): ShelfPreview {
  switch (action.type) {
    case SHELF_PREVIEW_QUERY:
      const {query} = action.payload;
      return {
        spec: fromSpecQuery(query.spec)
      };
    case SHELF_PREVIEW_SPEC:
      const {transform: _t, ...specWithoutTransform} = action.payload.spec;
      const specQ = fromSpec(specWithoutTransform);
      return {
        spec: fromSpecQuery(specQ)
      };

    // Spec Loading should also clear shelf preview
    case SPEC_LOAD:
    case SHELF_LOAD_QUERY:
    case SHELF_PREVIEW_DISABLE:
      return {spec: null};
  }
  return preview;
}
