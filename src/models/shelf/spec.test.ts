import {fromSpecQuery, toSpecQuery} from './spec';

const SHORT_WILDCARD = '?';
// FIXME doing property import can break the test
// import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';

describe('models/shelf/unit', () => {
  describe('fromSpecQuery', () => {
    it('returns a shelf unit spec', () => {
      expect(fromSpecQuery({
        mark: 'point',
        encodings: [
          {channel: 'x', field: 'a', type: 'quantitative'},
          {channel: '?', field: 'b', type: 'ordinal'}
        ],
        config: {numberFormat: 'd'}
      })).toEqual({
        mark: 'point',
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        },
        anyEncodings: [
          {channel: SHORT_WILDCARD, field: 'b', type: 'ordinal'}
        ],
        config: {numberFormat: 'd'}
      });
    });
  });

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
