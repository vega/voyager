import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {toSpecQuery} from './spec';

describe('models/shelf/unit', () => {
  describe('toSpecQuery', () => {
    it('should produce correct spec query', () => {
      expect(toSpecQuery({
        mark: 'point',
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        },
        anyEncodings: [
          {channel: SHORT_WILDCARD, field: 'b', type: 'ordinal'}
        ],
        config: {numberFormat: 'd'}
      })).toEqual({
        mark: 'point',
        encodings: [
          {channel: 'x', field: 'a', type: 'quantitative'},
          {channel: '?', field: 'b', type: 'ordinal'}
        ],
        config: {numberFormat: 'd'}
      });
    });
  });
});
