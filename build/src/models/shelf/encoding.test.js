"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var encoding_1 = require("./encoding");
describe('models/shelf/encoding', function () {
    describe('fromEncodingQueries', function () {
        it('converts an array of encodingQueries into encoding mixins', function () {
            expect(encoding_1.fromEncodingQueries([
                { channel: 'x', field: 'a', type: 'quantitative' },
                { channel: '?', field: 'a', type: 'quantitative' }
            ])).toEqual({
                encoding: {
                    x: { field: 'a', type: 'quantitative' }
                },
                anyEncodings: [
                    { channel: '?', field: 'a', type: 'quantitative' }
                ]
            });
        });
    });
});
