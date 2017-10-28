import {RELATED_VIEWS_HIDE_TOGGLE} from '../actions/related-views';
import {RelatedViewToggler} from '../models/relatedViewToggler';
import {relatedViewReducer} from './related-views';

describe('reducers/related-views', () => {
  it('should toggle relatedViewToggler to hide related-views', () => {
    const expectedRelatedViewToggler: RelatedViewToggler = {
      isHidden: true
    };
    expect(relatedViewReducer(
      {
        isHidden: false
      },
      {
        type: RELATED_VIEWS_HIDE_TOGGLE
      }
    )).toEqual(expectedRelatedViewToggler);
  });
});

describe('reducers/related-views', () => {
  it('should toggle relatedViewToggler to unhide related-views', () => {
    const expectedRelatedViewToggler: RelatedViewToggler = {
      isHidden: false
    };
    expect(relatedViewReducer(
      {
        isHidden: true
      },
      {
        type: RELATED_VIEWS_HIDE_TOGGLE
      }
    )).toEqual(expectedRelatedViewToggler);
  });
});
