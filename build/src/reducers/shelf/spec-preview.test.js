"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shelf_1 = require("../../actions/shelf");
var spec_preview_1 = require("./spec-preview");
describe('reducers/shelf/spec-preview', function () {
    describe(shelf_1.SHELF_SPEC_PREVIEW, function () {
        it('sets specPreview to be a shelf-spec', function () {
            var specPreview = spec_preview_1.shelfSpecPreviewReducer(null, {
                type: shelf_1.SHELF_SPEC_PREVIEW,
                payload: {
                    spec: {
                        mark: 'bar',
                        encoding: {
                            x: { field: 'b', type: 'nominal' },
                            y: { aggregate: 'count', field: '*', type: 'quantitative' }
                        }
                    }
                }
            });
            expect(specPreview).toEqual({
                mark: 'bar',
                encoding: {
                    x: { field: 'b', type: 'nominal' },
                    y: { aggregate: 'count', field: '*', type: 'quantitative' }
                },
                anyEncodings: [],
                config: undefined,
                filters: []
            });
        });
    });
    describe(shelf_1.SHELF_SPEC_PREVIEW, function () {
        it('sets specPreview to null', function () {
            var specPreview = spec_preview_1.shelfSpecPreviewReducer({
                mark: 'bar',
                encoding: {
                    x: { field: 'b', type: 'nominal' },
                    y: { aggregate: 'count', field: '*', type: 'quantitative' }
                },
                anyEncodings: [],
                config: undefined,
                filters: []
            }, { type: shelf_1.SHELF_SPEC_PREVIEW_DISABLE });
            expect(specPreview).toEqual(null);
        });
    });
});
