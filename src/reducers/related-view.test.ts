import {RELATED_VIEWS_HIDE_TOGGLE} from '../actions/related-views';
import {RelatedViews} from '../models/related-views';
import {relatedViewsReducer} from './related-views';

describe('reducers/related-views', () => {
  it('should toggle relatedViewsToggler to hide related-views', () => {
    const expectedRelatedViews: RelatedViews = {
      isCollapsed: true
    };
    expect(relatedViewsReducer(
      {
        isCollapsed: false
      },
      {
        type: RELATED_VIEWS_HIDE_TOGGLE,
        payload: {
          newIsCollapsed: true
        }
      }
    )).toEqual(expectedRelatedViews);
  });
});

describe(RELATED_VIEWS_HIDE_TOGGLE, () => {
  it('should toggle relatedViewToggler to unhide related-views', () => {
    const expectedRelatedViews: RelatedViews = {
      isCollapsed: false
    };
    expect(relatedViewsReducer(
      {
        isCollapsed: true
      },
      {
        type: RELATED_VIEWS_HIDE_TOGGLE,
        payload: {
          newIsCollapsed: false
        }
      }
    )).toEqual(expectedRelatedViews);
  });
});

describe(RELATED_VIEWS_HIDE_TOGGLE, () => {
  it('should toggle relatedViewToggler to hide related-views based on config value set to true ' +
    'when default state value undefined',
    () => {
      const expectedRelatedViews: RelatedViews = {
        isCollapsed: false
      };
      expect(relatedViewsReducer(
        {
          isCollapsed: undefined
        },
        {
          type: RELATED_VIEWS_HIDE_TOGGLE,
          payload: {
            newIsCollapsed: false
          }
        }
      )).toEqual(expectedRelatedViews);
    });
});

describe(RELATED_VIEWS_HIDE_TOGGLE, () => {
  it('should toggle relatedViewToggler to show related-views based on config value set to false when default ' +
    'state value undefined', () => {
    const expectedRelatedViews: RelatedViews = {
      isCollapsed: true
    };
    expect(relatedViewsReducer(
      {
        isCollapsed: undefined
      },
      {
        type: RELATED_VIEWS_HIDE_TOGGLE,
        payload: {
          newIsCollapsed: true
        }
      }
    )).toEqual(expectedRelatedViews);
  });
});
