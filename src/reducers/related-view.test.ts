import {RELATED_VIEW_HIDE_TOGGLE} from '../actions/related-views';
import {RelatedViewToggler} from '../models/relatedViewToggler';
import {relatedViewReducer} from './related-views';

describe('reducers/related-views', () => {
  it('should toggle relatedViewToggler to hide related-views', () => {
    const expectedRelatedViewToggler: RelatedViewToggler = {
      isRelatedViewHidden: true
    };
    expect(relatedViewReducer(
      {
        isRelatedViewHidden: false
      },
      {
        type: RELATED_VIEW_HIDE_TOGGLE
      }
    )).toEqual(expectedRelatedViewToggler);
  });
});

describe('reducers/related-views', () => {
  it('should toggle relatedViewToggler to unhide related-views', () => {
    const expectedRelatedViewToggler: RelatedViewToggler = {
      isRelatedViewHidden: false
    };
    expect(relatedViewReducer(
      {
        isRelatedViewHidden: true
      },
      {
        type: RELATED_VIEW_HIDE_TOGGLE
      }
    )).toEqual(expectedRelatedViewToggler);
  });
});
