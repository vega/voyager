"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var function_1 = require("./function");
describe('model/shelf/function', function () {
    describe('sortFunctions', function () {
        it('should sort a shelf function array with undefined correctly', function () {
            expect(function_1.sortFunctions(['minutes', 'year', undefined])).toEqual([undefined, 'year', 'minutes']);
        });
    });
    describe('toFieldQueryFunctionMixins', function () {
        it('returns correct value for no function', function () {
            expect(function_1.toFieldQueryFunctionMixins(undefined)).toEqual({});
        });
        it('returns correct value for raw aggregate', function () {
            expect(function_1.toFieldQueryFunctionMixins('mean')).toEqual({ aggregate: 'mean' });
        });
        it('returns correct value for raw timeUnit', function () {
            expect(function_1.toFieldQueryFunctionMixins('year')).toEqual({ timeUnit: 'year' });
        });
        it('returns correct value for bin', function () {
            expect(function_1.toFieldQueryFunctionMixins('bin')).toEqual({ bin: true });
        });
        it('returns correct value for a wildcard with undefined, aggregate and bin', function () {
            var wildcardFn = {
                enum: [undefined, 'bin', 'mean']
            };
            expect(function_1.toFieldQueryFunctionMixins(wildcardFn)).toEqual({
                bin: {
                    enum: [false, true]
                },
                aggregate: {
                    enum: [undefined, 'mean']
                }
            });
        });
        it('returns correct value for a wildcard with aggregate and bin', function () {
            var wildcardFn = {
                enum: ['bin', 'mean']
            };
            expect(function_1.toFieldQueryFunctionMixins(wildcardFn)).toEqual({
                bin: {
                    enum: [false, true]
                },
                aggregate: {
                    enum: [undefined, 'mean']
                },
                hasFn: true
            });
        });
        it('returns ordered values for a wildcard with multiple aggregates', function () {
            var wildcardFn = {
                enum: ['median', 'mean']
            };
            expect(function_1.toFieldQueryFunctionMixins(wildcardFn)).toEqual({
                aggregate: {
                    enum: ['mean', 'median']
                },
                hasFn: true
            });
        });
        it('returns correct value for a wildcard with multiple timeUnits', function () {
            var wildcardFn = {
                enum: ['year', 'month']
            };
            expect(function_1.toFieldQueryFunctionMixins(wildcardFn)).toEqual({
                timeUnit: {
                    enum: ['year', 'month']
                },
                hasFn: true
            });
        });
        it('returns correct value for a wildcard with undefined and timeUnit', function () {
            var wildcardFn = {
                enum: [undefined, 'month']
            };
            expect(function_1.toFieldQueryFunctionMixins(wildcardFn)).toEqual({
                timeUnit: {
                    enum: [undefined, 'month']
                }
            });
        });
        it('returns correct value for a wildcard with timeUnit only', function () {
            var wildcardFn = {
                enum: ['year']
            };
            expect(function_1.toFieldQueryFunctionMixins(wildcardFn)).toEqual({
                timeUnit: {
                    enum: ['year']
                },
                hasFn: true
            });
        });
        it('returns correct value for a wildcard with undefined and bin', function () {
            var wildcardFn = {
                enum: [undefined, 'bin']
            };
            expect(function_1.toFieldQueryFunctionMixins(wildcardFn)).toEqual({
                bin: {
                    enum: [false, true]
                }
            });
        });
        it('returns correct value for a wildcard with bin only', function () {
            var wildcardFn = {
                enum: ['bin']
            };
            expect(function_1.toFieldQueryFunctionMixins(wildcardFn)).toEqual({
                bin: {
                    enum: [true]
                },
                hasFn: true
            });
        });
        it('returns correct value for a wildcard with undefined only', function () {
            var wildcardFn = {
                enum: [undefined]
            };
            expect(function_1.toFieldQueryFunctionMixins(wildcardFn)).toEqual({
                bin: {
                    enum: [false]
                },
                timeUnit: {
                    enum: [undefined]
                },
                aggregate: {
                    enum: [undefined]
                }
            });
        });
    });
    describe('fromFieldQueryFunctionMixins', function () {
        it('is inverse of toFunctionMixins', function () {
            var fns = [
                undefined,
                'mean',
                'year',
                'bin',
                { enum: [undefined, 'bin', 'mean'] },
                { enum: ['bin', 'mean'] },
                { enum: [undefined, 'mean', 'median'] },
                { enum: ['mean', 'median'] },
                { enum: ['mean'] },
                { enum: [undefined, 'bin'] },
                { enum: ['bin'] },
                { enum: [undefined, 'month'] },
                { enum: ['year', 'month'] },
                { enum: ['year'] },
                { enum: [undefined] },
            ];
            for (var _i = 0, fns_1 = fns; _i < fns_1.length; _i++) {
                var fn = fns_1[_i];
                expect(function_1.fromFieldQueryFunctionMixins(function_1.toFieldQueryFunctionMixins(fn))).toEqual(fn);
            }
        });
        it('correctly treat SHORT_WILDCARD for bin and aggregate', function () {
            expect(function_1.fromFieldQueryFunctionMixins({
                bin: '?',
                aggregate: '?',
                hasFn: true
            })).toEqual({ enum: ['bin', 'mean'] });
        });
    });
});
//# sourceMappingURL=function.test.js.map