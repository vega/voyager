import {toQuery} from './index';

describe('models/shelf', () => {
  describe('toQuery', () => {
    it('returns the correct query', () => {
      expect(toQuery({
        spec: {
          mark: 'point',
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          },
          anyEncodings: [],
          config: {numberFormat: 'd'}
        }
      })).toEqual({
        spec: {
          mark: 'point',
          encodings: [
            {channel: 'x', field: 'a', type: 'quantitative'},
          ],
          config: {numberFormat: 'd'}
        }
      });
    });
  })
});
