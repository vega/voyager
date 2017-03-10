import {fromEncodingQueries} from './encoding';

describe('models/shelf/encoding', () => {
  describe('fromEncodingQueries', () => {
    it('converts an array of encodingQueries into encoding mixins', () => {
      expect(fromEncodingQueries([
        {channel: 'x', field: 'a', type: 'quantitative'},
        {channel: '?', field: 'a', type: 'quantitative'}
      ])).toEqual({
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        },
        anyEncodings: [
          {channel: '?', field: 'a', type: 'quantitative'}
        ]
      });
    });
  });
});
