import {fromSpecQuery, toSpecQuery} from './index';

const SHORT_WILDCARD = '?';

describe('models/shelf/unit', () => {
  describe('fromSpecQuery', () => {
    it('returns a shelf unit spec', () => {
      expect(fromSpecQuery({
        mark: 'point',
        encodings: [
          {channel: 'x', bin: true, field: 'a', type: 'quantitative'},
          {channel: '?', field: 'b', type: 'ordinal'} // ordinal should be converted to nominal
        ],
        config: {numberFormat: 'd'}
      })).toEqual({
        mark: 'point',
        encoding: {
          x: {fn: 'bin', field: 'a', type: 'quantitative'}
        },
        anyEncodings: [
          {channel: SHORT_WILDCARD, field: 'b', type: 'nominal'}
        ],
        config: {numberFormat: 'd'},
      });
    });
  });

  describe('toSpecQuery', () => {
    it('should produce correct spec query', () => {
      expect(toSpecQuery({
        mark: 'point',
        encoding: {
          x: {
            field: 'a', type: 'quantitative',
            sort: 'descending',
            scale: {type: 'linear'}
          }
        },
        anyEncodings: [
          {channel: SHORT_WILDCARD, field: 'b', type: 'nominal'}
        ],
        config: {numberFormat: 'd'},
      })).toEqual({
        mark: 'point',
        encodings: [
          {
            channel: 'x', field: 'a', type: 'quantitative',
            sort: 'descending',
            scale: {type: 'linear'}
          },
          {channel: '?', field: 'b', type: 'nominal'}
        ],
        config: {numberFormat: 'd'}
      });
    });
  });
});
