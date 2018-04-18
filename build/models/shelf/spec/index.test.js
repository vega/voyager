"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var SHORT_WILDCARD = '?';
describe('models/shelf/unit', function () {
    describe('fromSpecQuery', function () {
        it('returns a shelf unit spec', function () {
            expect(index_1.fromSpecQuery({
                mark: 'point',
                encodings: [
                    { channel: 'x', bin: true, field: 'a', type: 'quantitative' },
                    { channel: '?', field: 'b', type: 'ordinal' } // ordinal should be converted to nominal
                ],
                config: { numberFormat: 'd' }
            })).toEqual({
                mark: 'point',
                encoding: {
                    x: { fn: 'bin', field: 'a', type: 'quantitative' }
                },
                anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'b', type: 'nominal' }
                ],
                config: { numberFormat: 'd' },
            });
        });
    });
    describe('toSpecQuery', function () {
        it('should produce correct spec query', function () {
            expect(index_1.toSpecQuery({
                mark: 'point',
                encoding: {
                    x: {
                        field: 'a', type: 'quantitative',
                        sort: 'descending',
                        scale: { type: 'linear' }
                    }
                },
                anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'b', type: 'nominal' }
                ],
                config: { numberFormat: 'd' },
            })).toEqual({
                mark: 'point',
                encodings: [
                    {
                        channel: 'x', field: 'a', type: 'quantitative',
                        sort: 'descending',
                        scale: { type: 'linear' }
                    },
                    { channel: '?', field: 'b', type: 'nominal' }
                ],
                config: { numberFormat: 'd' }
            });
        });
    });
});
//# sourceMappingURL=index.test.js.map