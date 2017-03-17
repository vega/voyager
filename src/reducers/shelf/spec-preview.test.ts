import {SHELF_SPEC_PREVIEW, SHELF_SPEC_PREVIEW_DISABLE} from '../../actions/shelf';
import {shelfSpecPreviewReducer} from './spec-preview';

describe('reducers/shelf/spec-preview', () => {
  describe(SHELF_SPEC_PREVIEW, () => {
    it('sets specPreview to be a shelf-spec', () => {
      const specPreview = shelfSpecPreviewReducer(null, {
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

      expect(specPreview).toEqual({
        mark: 'bar',
        encoding: {
          x: {field: 'b', type: 'nominal'},
          y: {aggregate: 'count', field: '*', type: 'quantitative'}
        },
        anyEncodings: [],
        config: undefined
      });
    });
  });

  describe(SHELF_SPEC_PREVIEW, () => {
    it('sets specPreview to null', () => {
      const specPreview = shelfSpecPreviewReducer({
        mark: 'bar',
        encoding: {
          x: {field: 'b', type: 'nominal'},
          y: {aggregate: 'count', field: '*', type: 'quantitative'}
        },
        anyEncodings: [],
        config: undefined
      }, {type: SHELF_SPEC_PREVIEW_DISABLE});

      expect(specPreview).toEqual(null);
    });
  });
});
