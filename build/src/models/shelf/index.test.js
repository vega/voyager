"use strict";
var index_1 = require("./index");
describe('models/shelf', function () {
    describe('autoAddFieldQuery', function () {
        it('makes a query that has an additional fieldQuery with wildcard channel', function () {
            expect(index_1.autoAddFieldQuery({
                mark: 'point',
                encoding: {
                    x: { field: 'a', type: 'quantitative' }
                },
                anyEncodings: [],
                config: { numberFormat: 'd' }
            }, { field: 'b', type: 'nominal' })).toEqual({
                spec: {
                    mark: 'point',
                    encodings: [
                        { channel: 'x', field: 'a', type: 'quantitative' },
                        { channel: '?', field: 'b', type: 'nominal' }
                    ],
                    config: { numberFormat: 'd' }
                },
                chooseBy: 'effectiveness'
            });
        });
    });
    describe('toQuery', function () {
        it('returns a query that groups by encoding and does not auto add count' +
            'if there is no wildcard', function () {
            expect(index_1.toQuery({
                spec: {
                    mark: 'point',
                    encoding: {
                        x: { field: 'a', type: 'quantitative' }
                    },
                    anyEncodings: [],
                    config: { numberFormat: 'd' }
                },
                specPreview: null
            })).toEqual({
                spec: {
                    mark: 'point',
                    encodings: [
                        { channel: 'x', field: 'a', type: 'quantitative' },
                    ],
                    config: { numberFormat: 'd' }
                },
                groupBy: 'encoding',
                chooseBy: index_1.DEFAULT_CHOOSE_BY,
                orderBy: index_1.DEFAULT_ORDER_BY,
                config: {
                    autoAddCount: false
                }
            });
        });
        it('returns the query that groups by field and auto add count if there is a wildcard field', function () {
            expect(index_1.toQuery({
                spec: {
                    mark: 'point',
                    encoding: {
                        x: { field: '?', type: 'quantitative' }
                    },
                    anyEncodings: [],
                    config: { numberFormat: 'd' }
                },
                specPreview: null
            })).toEqual({
                spec: {
                    mark: 'point',
                    encodings: [
                        { channel: 'x', field: '?', type: 'quantitative' },
                    ],
                    config: { numberFormat: 'd' }
                },
                groupBy: 'field',
                chooseBy: index_1.DEFAULT_CHOOSE_BY,
                orderBy: index_1.DEFAULT_ORDER_BY,
                config: {
                    autoAddCount: true
                }
            });
        });
        it('returns the query that groups by field transform and auto add count' +
            'if there is a wildcard field and function', function () {
            expect(index_1.toQuery({
                spec: {
                    mark: 'point',
                    encoding: {
                        x: { aggregate: '?', field: '?', type: 'quantitative' }
                    },
                    anyEncodings: [],
                    config: { numberFormat: 'd' }
                },
                specPreview: null
            })).toEqual({
                spec: {
                    mark: 'point',
                    encodings: [
                        { channel: 'x', aggregate: '?', field: '?', type: 'quantitative' },
                    ],
                    config: { numberFormat: 'd' }
                },
                groupBy: 'fieldTransform',
                chooseBy: index_1.DEFAULT_CHOOSE_BY,
                orderBy: index_1.DEFAULT_ORDER_BY,
                config: {
                    autoAddCount: true
                }
            });
        });
    });
});
