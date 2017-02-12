import {toSpecQuery} from './shelf';

describe('models/shelf', () => {
  describe('toSpecQuery', () => {
    it('should produce correct spec query', () => {
      expect(toSpecQuery({
        mark: 'point',
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        },
        anyEncodings: [
          {channel: '?', field: 'b', type: 'ordinal"'}
        ],
        config: {numberFormat: 'd'}
      })).toEqual({
        mark: 'point',
        encodings: [
          {channel: 'x', field: 'a', type: 'quantitative'},
          {channel: '?', field: 'b', type: 'ordinal"'}
        ],
        config: {numberFormat: 'd'}
      });
    });
  });
});
