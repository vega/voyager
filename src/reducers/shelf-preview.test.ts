import {SHELF_SPEC_PREVIEW, SHELF_SPEC_PREVIEW_DISABLE} from '../actions/shelf-preview';
import {shelfPreviewReducer} from './shelf-preview';

describe('reducers/shelf/spec-preview', () => {
  describe(SHELF_SPEC_PREVIEW, () => {
    it('sets specPreview to be a shelf-spec', () => {
      const specPreview = shelfPreviewReducer({spec: null}, {
        type: SHELF_SPEC_PREVIEW,
        payload: {
          spec: {
            mark: 'bar',
            encoding: {
              x: {field: 'b', type: 'nominal'},
              y: {aggregate: 'count', field: '*', type: 'quantitative'}
            }
          }
        }
      });

      expect(specPreview.spec).toEqual({
        mark: 'bar',
        encoding: {
          x: {field: 'b', type: 'nominal'},
          y: {aggregate: 'count', field: '*', type: 'quantitative'}
        },
        anyEncodings: [],
        config: undefined,
        filters: []
      });
    });
  });

  describe(SHELF_SPEC_PREVIEW, () => {
    it('sets specPreview to null', () => {
      const specPreview = shelfPreviewReducer({spec: {
        mark: 'bar',
        encoding: {
          x: {field: 'b', type: 'nominal'},
          y: {aggregate: 'count', field: '*', type: 'quantitative'}
        },
        anyEncodings: [],
        config: undefined,
        filters: []
      }}, {type: SHELF_SPEC_PREVIEW_DISABLE});

      expect(specPreview.spec).toEqual(null);
    });
  });
});
