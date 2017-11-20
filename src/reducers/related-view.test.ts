import {RELATED_VIEWS_HIDE_TOGGLE} from '../actions/related-views';
import {RelatedViews} from '../models/related-views';
import {relatedViewsReducer} from './related-views';

describe('reducers/related-views', () => {
  it('should toggle relatedViewsToggler to hide related-views', () => {
    const expectedRelatedViews: RelatedViews = {
      isHidden: true
    };
    expect(relatedViewsReducer(
      {
        isHidden: false
      },
      {
        type: RELATED_VIEWS_HIDE_TOGGLE
      }
    )).toEqual(expectedRelatedViews);
  });
});

describe(RELATED_VIEWS_HIDE_TOGGLE, () => {
  it('should toggle relatedViewToggler to unhide related-views', () => {
    const expectedRelatedViews: RelatedViews = {
      isHidden: false
    };
    expect(relatedViewsReducer(
      {
        isHidden: true
      },
      {
        type: RELATED_VIEWS_HIDE_TOGGLE
      }
    )).toEqual(expectedRelatedViews);
  });
});
