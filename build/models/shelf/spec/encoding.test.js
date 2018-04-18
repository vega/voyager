"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var encoding_1 = require("./encoding");
describe('models/shelf', function () {
    describe('fromEncodingQueries', function () {
        it('converts an array of encodingQueries into encoding mixins', function () {
            expect(encoding_1.fromEncodingQueries([
                { channel: 'x', field: 'a', type: 'quantitative', sort: 'descending', axis: { orient: 'top' } },
                { channel: '?', field: 'a', type: 'quantitative', scale: { type: 'log' } }
            ])).toEqual({
                encoding: {
                    x: { field: 'a', type: 'quantitative', sort: 'descending', axis: { orient: 'top' } }
                },
                anyEncodings: [
                    { channel: '?', field: 'a', type: 'quantitative', scale: { type: 'log' } }
                ]
            });
        });
    });
    describe('fromFieldQueryNestedProp', function () {
        it('throws error for boolean', function () {
            var fieldQuery = { channel: '?', field: 'a', type: 'quantitative', scale: true };
            expect(function () { return encoding_1.fromFieldQueryNestedProp(fieldQuery, 'scale'); })
                .toThrowError('Voyager does not support boolean scale');
        });
        it('throws error for wildcard', function () {
            var fieldQuery = { channel: '?', field: 'a', type: 'quantitative', scale: '?' };
            expect(function () { return encoding_1.fromFieldQueryNestedProp(fieldQuery, 'scale'); })
                .toThrowError('Voyager does not support wildcard scale');
        });
        it('throws error for scale with wildcard', function () {
            var scale = { type: { enum: ['linear'] } };
            var fieldQuery = { channel: '?', field: 'a', type: 'quantitative', scale: scale };
            expect(function () { return encoding_1.fromFieldQueryNestedProp(fieldQuery, 'scale'); })
                .toThrowError('Voyager does not support wildcard scale type');
        });
    });
});
//# sourceMappingURL=encoding.test.js.map