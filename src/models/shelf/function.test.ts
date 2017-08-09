import {Wildcard} from 'compassql/build/src/wildcard';
import {fromFieldQueryFunctionMixins, ShelfFunction, toFunctionMixins} from './function';

describe('model/shelf/function', () => {
  describe('toFunctionMixins', () => {
    it('returns correct value for no function', () => {
      expect(toFunctionMixins(undefined)).toEqual({});
    });

    it('returns correct value for raw aggregate', () => {
      expect(toFunctionMixins('mean')).toEqual({aggregate: 'mean'});
    });

    it('returns correct value for raw timeUnit', () => {
      expect(toFunctionMixins('year')).toEqual({timeUnit: 'year'});
    });

    it('returns correct value for bin', () => {
      expect(toFunctionMixins('bin')).toEqual({bin: true});
    });

    it('returns correct value for a wildcard with undefined, aggregate and bin', () => {
      const wildcardFn: Wildcard<ShelfFunction> = {
        enum: [undefined, 'bin', 'mean']
      };

      expect(toFunctionMixins(wildcardFn)).toEqual({
        bin: {
          enum: [false, true]
        },
        aggregate: {
          enum: [undefined, 'mean']
        }
      });
    });

    it('returns correct value for a wildcard with aggregate and bin', () => {
      const wildcardFn: Wildcard<ShelfFunction> = {
        enum: ['bin', 'mean']
      };

      expect(toFunctionMixins(wildcardFn)).toEqual({
        bin: {
          enum: [false, true]
        },
        aggregate: {
          enum: [undefined, 'mean']
        },
        hasFn: true
      });
    });

    it('returns ordered values for a wildcard with multiple aggregates', () => {
      const wildcardFn: Wildcard<ShelfFunction> = {
        enum: ['median', 'mean']
      };

      expect(toFunctionMixins(wildcardFn)).toEqual({
        aggregate: {
          enum: ['mean', 'median']
        },
        hasFn: true
      });
    });

    it('returns correct value for a wildcard with multiple timeUnits', () => {
      const wildcardFn: Wildcard<ShelfFunction> = {
        enum: ['year', 'month']
      };

      expect(toFunctionMixins(wildcardFn)).toEqual({
        timeUnit: {
          enum: ['year', 'month']
        },
        hasFn: true
      });
    });

    it('returns correct value for a wildcard with undefined and timeUnit', () => {
      const wildcardFn: Wildcard<ShelfFunction> = {
        enum: [undefined, 'month']
      };

      expect(toFunctionMixins(wildcardFn)).toEqual({
        timeUnit: {
          enum: [undefined, 'month']
        }
      });
    });

    it('returns correct value for a wildcard with timeUnit only', () => {
      const wildcardFn: Wildcard<ShelfFunction> = {
        enum: ['year']
      };

      expect(toFunctionMixins(wildcardFn)).toEqual({
        timeUnit: {
          enum: ['year']
        },
        hasFn: true
      });
    });

    it('returns correct value for a wildcard with undefined and bin', () => {
      const wildcardFn: Wildcard<ShelfFunction> = {
        enum: [undefined, 'bin']
      };

      expect(toFunctionMixins(wildcardFn)).toEqual({
        bin: {
          enum: [false, true]
        }
      });
    });

    it('returns correct value for a wildcard with bin only', () => {
      const wildcardFn: Wildcard<ShelfFunction> = {
        enum: ['bin']
      };

      expect(toFunctionMixins(wildcardFn)).toEqual({
        bin: {
          enum: [true]
        },
        hasFn: true
      });
    });
    it('returns correct value for a wildcard with undefined only', () => {
      const wildcardFn: Wildcard<ShelfFunction> = {
        enum: [undefined]
      };

      expect(toFunctionMixins(wildcardFn)).toEqual({
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

  describe('fromFieldQueryFunctionMixins', () => {
    it('is inverse of toFunctionMixins', () => {
      const fns: Array<ShelfFunction | Wildcard<ShelfFunction>> = [
        undefined,
        'mean',
        'year',
        'bin',
        {enum: [undefined, 'bin', 'mean']},
        {enum: ['bin', 'mean']},
        {enum: [undefined, 'mean', 'median']},
        {enum: ['mean', 'median']},
        {enum: ['mean']},
        {enum: [undefined, 'bin']},
        {enum: ['bin']},
        {enum: [undefined, 'month']},
        {enum: ['year', 'month']},
        {enum: ['year']},
        {enum: [undefined]},
      ];
      for (const fn of fns) {
        expect(fromFieldQueryFunctionMixins(toFunctionMixins(fn))).toEqual(fn);
      }
    });
  });
});
