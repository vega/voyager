import {fromSpec} from 'compassql/build/src/query/spec';
import {Action} from '../actions/index';
import {SHELF_PREVIEW_DISABLE, SHELF_PREVIEW_QUERY, SHELF_PREVIEW_SPEC} from '../actions/shelf-preview';
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
      const {spec} = action.payload;
      const specQ = fromSpec(spec);
      return {
        spec: fromSpecQuery(specQ)
      };
    case SHELF_PREVIEW_DISABLE:
      return {spec: null};
  }
  return preview;
}
