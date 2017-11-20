import { Action } from '../actions/index';
import { RELATED_VIEWS_HIDE_TOGGLE } from '../actions/related-views';
import { DEFAULT_RELATED_VIEWS, RelatedViews } from '../models/related-views';

export function relatedViewsReducer(relatedViewToggler: RelatedViews = DEFAULT_RELATED_VIEWS,
                                    action: Action): RelatedViews {
  const { isHidden } = relatedViewToggler;
  switch (action.type) {
    case RELATED_VIEWS_HIDE_TOGGLE: {
      return {
        isHidden: !isHidden
      };
    }
  }

  return relatedViewToggler;
}
