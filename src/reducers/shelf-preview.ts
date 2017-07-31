import {fromSpec} from 'compassql/build/src/query/spec';
import {Action} from '../actions/index';
import {SHELF_SPEC_PREVIEW, SHELF_SPEC_PREVIEW_DISABLE} from '../actions/shelf-preview';
import {fromSpecQuery} from '../models/shelf/spec';
import {DEFAULT_SHELF_PREVIEW_SPEC, ShelfPreview} from '../models/shelfPreview';


export function shelfPreviewReducer(preview: ShelfPreview = DEFAULT_SHELF_PREVIEW_SPEC,
                                    action: Action): ShelfPreview {
  switch (action.type) {
    case SHELF_SPEC_PREVIEW:
      const {spec} = action.payload;
      const specQ = fromSpec(spec);
      return {
        spec: fromSpecQuery(specQ)
      };
    case SHELF_SPEC_PREVIEW_DISABLE:
      return {spec: null};
  }
  return preview;
}
