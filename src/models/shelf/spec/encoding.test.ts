import {FieldQuery, ScaleQuery} from 'compassql/build/src/query/encoding';
import {fromEncodingQueries, fromFieldQueryNestedProp} from './encoding';

describe('models/shelf', () => {
  describe('fromEncodingQueries', () => {
    it('converts an array of encodingQueries into encoding mixins', () => {
      expect(fromEncodingQueries([
        {channel: 'x', field: 'a', type: 'quantitative', sort: 'descending', axis: {orient: 'top'}},
        {channel: '?', field: 'a', type: 'quantitative', scale: {type: 'log'}}
      ])).toEqual({
        encoding: {
          x: {field: 'a', type: 'quantitative', sort: 'descending', axis: {orient: 'top'}}
        },
        anyEncodings: [
          {channel: '?', field: 'a', type: 'quantitative', scale: {type: 'log'}}
        ]
      });
    });
  });

  describe('fromFieldQueryNestedProp', () => {
    it('throws error for boolean', () => {
      const fieldQuery: FieldQuery = {channel: '?', field: 'a', type: 'quantitative', scale: true};
      expect(() => fromFieldQueryNestedProp(fieldQuery, 'scale'))
        .toThrowError('Voyager does not support boolean scale');
    });

    it('throws error for wildcard', () => {
      const fieldQuery: FieldQuery = {channel: '?', field: 'a', type: 'quantitative', scale: '?'};
      expect(() => fromFieldQueryNestedProp(fieldQuery, 'scale'))
        .toThrowError('Voyager does not support wildcard scale');
    });

    it('throws error for scale with wildcard', () => {
      const scale: ScaleQuery = {type: {enum: ['linear']}};
      const fieldQuery: FieldQuery = {channel: '?', field: 'a', type: 'quantitative', scale};
      expect(() => fromFieldQueryNestedProp(fieldQuery, 'scale'))
        .toThrowError('Voyager does not support wildcard scale type');
    });
  });
});
