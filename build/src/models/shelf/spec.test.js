"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("./spec");
var SHORT_WILDCARD = '?';
// FIXME doing property import can break the test
// import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
describe('models/shelf/unit', function () {
    describe('fromSpecQuery', function () {
        it('returns a shelf unit spec', function () {
            expect(spec_1.fromSpecQuery({
                mark: 'point',
                encodings: [
                    { channel: 'x', field: 'a', type: 'quantitative' },
                    { channel: '?', field: 'b', type: 'ordinal' }
                ],
                config: { numberFormat: 'd' }
            })).toEqual({
                mark: 'point',
                encoding: {
                    x: { field: 'a', type: 'quantitative' }
                },
                anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'b', type: 'ordinal' }
                ],
                config: { numberFormat: 'd' },
                filters: []
            });
        });
    });
    describe('toSpecQuery', function () {
        it('should produce correct spec query', function () {
            expect(spec_1.toSpecQuery({
                mark: 'point',
                encoding: {
                    x: { field: 'a', type: 'quantitative' }
                },
                anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'b', type: 'ordinal' }
                ],
                config: { numberFormat: 'd' },
                filters: []
            })).toEqual({
                mark: 'point',
                encodings: [
                    { channel: 'x', field: 'a', type: 'quantitative' },
                    { channel: '?', field: 'b', type: 'ordinal' }
                ],
                config: { numberFormat: 'd' },
                transform: []
            });
        });
    });
});
