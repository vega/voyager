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
    describe('fromEncodingQuery', function () {
        it('throws error for autocount query', function () {
            var autoCountQuery = {
                channel: 'x',
                description: '',
                autoCount: true,
                type: 'quantitative'
            };
            expect(function () { return encoding_1.fromEncodingQuery(autoCountQuery); }).toThrowError('AutoCount Query not yet supported');
        });
    });
    describe('toEncodingQuery', function () {
        it('should return fieldQuery', function () {
            var encDef = {
                field: '?'
            };
            var res = encoding_1.toEncodingQuery(encDef, 'x');
            expect(res).toEqual({
                channel: 'x',
                field: '?'
            });
        });
        it('should return valueQuery', function () {
            var valueDef = {
                value: 'blue'
            };
            var res = encoding_1.toEncodingQuery(valueDef, 'color');
            expect(res).toEqual({
                channel: 'color',
                value: 'blue'
            });
        });
    });
    describe('toValueQuery', function () {
        it('should return a valid ValueQuery', function () {
            var valueDef = {
                value: 'blue'
            };
            var res = encoding_1.toValueQuery(valueDef, 'color');
            expect(res).toEqual({
                channel: 'color',
                value: 'blue'
            });
        });
    });
    describe('fromValueQuery', function () {
        it('throws error for wildcard value', function () {
            var fieldQuery = {
                value: '?',
                channel: '?',
                description: ''
            };
            expect(function () { return encoding_1.fromValueQuery(fieldQuery); }).toThrowError('Voyager does not support wildcard value');
        });
        it('should return valueDef', function () {
            var fieldQuery = {
                description: '',
                channel: 'color',
                value: 'blue'
            };
            expect(encoding_1.fromValueQuery(fieldQuery)).toEqual({
                value: 'blue'
            });
        });
    });
    describe('isShelfFieldDef', function () {
        it('should return true given ShelfFieldDef', function () {
            var fieldDef = {
                field: '?'
            };
            expect(encoding_1.isShelfFieldDef(fieldDef)).toEqual(true);
        });
        it('should return false given ShelfValueDef', function () {
            var valueDef = {
                value: 'blue'
            };
            expect(encoding_1.isShelfFieldDef(valueDef)).toEqual(false);
        });
    });
    describe('isShelfValueDef', function () {
        it('should return true given ShelfValueDef', function () {
            var valueDef = {
                value: 'blue'
            };
            expect(encoding_1.isShelfValueDef(valueDef)).toEqual(true);
        });
        it('should return false given ShelfFieldDef', function () {
            var fieldDef = {
                field: '?'
            };
            expect(encoding_1.isShelfValueDef(fieldDef)).toEqual(false);
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