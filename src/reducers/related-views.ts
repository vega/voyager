import {Action} from '../actions/index';
import {DEFAULT_RELATED_VIEWS, RelatedViews} from '../models/related-views';

export function relatedViewsReducer(relatedViewToggler: RelatedViews = DEFAULT_RELATED_VIEWS,
                                    action: Action): RelatedViews {
  const {isHidden} = relatedViewToggler;
  return {
    isHidden: !isHidden
  };
}
