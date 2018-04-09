import { Action } from '../actions/index';
import { RELATED_VIEWS_HIDE_TOGGLE } from '../actions/related-views';
import { DEFAULT_RELATED_VIEWS, RelatedViews } from '../models/related-views';

export function relatedViewsReducer(
  relatedViewToggler: RelatedViews = DEFAULT_RELATED_VIEWS, action: Action): RelatedViews {
  switch (action.type) {
    case RELATED_VIEWS_HIDE_TOGGLE: {
      const {newIsCollapsed} = action.payload;
      return {
        isCollapsed: newIsCollapsed
      };
    }
  }

  return relatedViewToggler;
}
