import {Action} from '../actions/index';
import {DEFAULT_RELATED_VIEW_TOGGLER, RelatedViewToggler} from '../models/relatedViewToggler';

export function relatedViewReducer(relatedViewToggler: RelatedViewToggler = DEFAULT_RELATED_VIEW_TOGGLER,
                                   action: Action): RelatedViewToggler {
  const {isHidden} = relatedViewToggler;
  return {
    isHidden: !isHidden
  };
}
