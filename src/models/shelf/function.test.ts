import {Wildcard} from 'compassql/build/src/wildcard';
import {fromFieldQueryFunctionMixins, ShelfFunction, sortFunctions, toFunctionMixins} from './function';

describe('model/shelf/function', () => {
  describe('sortFunctions', () => {
    it('re-orders functions based on their order in the UI', () => {
      expect(sortFunctions(['mean', 'bin', undefined]))
        .toEqual([undefined, 'bin', 'mean']);

      expect(sortFunctions(['month', 'year', undefined]))
        .toEqual([undefined, 'year', 'month']);
    });
  });
});
