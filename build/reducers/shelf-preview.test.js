"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shelf_preview_1 = require("../actions/shelf-preview");
var shelf_preview_2 = require("./shelf-preview");
describe('reducers/shelf/spec-preview', function () {
    describe(shelf_preview_1.SHELF_PREVIEW_SPEC, function () {
        it('sets specPreview to be a shelf-spec', function () {
            var specPreview = shelf_preview_2.shelfPreviewReducer({ spec: null }, {
                type: shelf_preview_1.SHELF_PREVIEW_SPEC,
                payload: {
                    spec: {
                        mark: 'bar',
                        encoding: {
                            x: { field: 'b', type: 'nominal' },
                            y: { aggregate: 'count', field: '*', type: 'quantitative' }
                        },
                        data: {
                            format: {
                                parse: 'auto',
                                type: 'json'
                            },
                            name: 'testName'
                        }
                    }
                }
            });
            expect(specPreview.spec).toEqual({
                mark: 'bar',
                encoding: {
                    x: { field: 'b', type: 'nominal' },
                    y: { field: '*', fn: 'count', type: 'quantitative' }
                },
                anyEncodings: [],
                config: undefined
            });
        });
    });
    describe(shelf_preview_1.SHELF_PREVIEW_QUERY, function () {
        it('sets specPreview to be a shelf-spec', function () {
            var specPreview = shelf_preview_2.shelfPreviewReducer({ spec: null }, {
                type: shelf_preview_1.SHELF_PREVIEW_QUERY,
                payload: {
                    query: {
                        spec: {
                            mark: 'bar',
                            encodings: [
                                { channel: 'x', field: 'b', type: 'nominal' },
                                { channel: 'y', aggregate: 'count', field: '*', type: 'quantitative' }
                            ]
                        }
                    }
                }
            });
            expect(specPreview.spec).toEqual({
                mark: 'bar',
                encoding: {
                    x: { field: 'b', type: 'nominal' },
                    y: { field: '*', fn: 'count', type: 'quantitative' }
                },
                anyEncodings: [],
                config: undefined,
            });
        });
    });
    describe(shelf_preview_1.SHELF_PREVIEW_DISABLE, function () {
        it('sets specPreview to null', function () {
            var specPreview = shelf_preview_2.shelfPreviewReducer({ spec: {
                    mark: 'bar',
                    encoding: {
                        x: { field: 'b', type: 'nominal' },
                        y: { fn: 'count', field: '*', type: 'quantitative' }
                    },
                    anyEncodings: [],
                    config: undefined
                } }, { type: shelf_preview_1.SHELF_PREVIEW_DISABLE });
            expect(specPreview.spec).toEqual(null);
        });
    });
});
//# sourceMappingURL=shelf-preview.test.js.map