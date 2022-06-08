import {AutoCountQuery, FieldQuery, ScaleQuery, ValueQuery} from 'compassql/build/src/query/encoding';
import {ValueDef} from 'vega-lite/build/src/channeldef';
import {
  fromEncodingQueries,
  fromEncodingQuery,
  fromFieldQueryNestedProp,
  fromValueQuery, isShelfFieldDef, isShelfValueDef, ShelfFieldDef, ShelfValueDef, toEncodingQuery, toValueQuery
} from './encoding';

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

  describe('fromEncodingQuery', () => {
    it('throws error for autocount query', () => {
      const autoCountQuery: AutoCountQuery = {
        channel: 'x',
        description: '',
        autoCount: true,
        type: 'quantitative'
      };
      expect(() => fromEncodingQuery(autoCountQuery)).toThrowError('AutoCount Query not yet supported');
    });
  });

  describe('toEncodingQuery', () => {
    it('should return fieldQuery', () => {
      const encDef: ShelfFieldDef = {
        field: '?'
      };
      const res = toEncodingQuery(encDef, 'x');
      expect(res).toEqual({
        channel: 'x',
        field: '?'
      });
    });

    it('should return valueQuery', () => {
      const valueDef: ValueDef = {
        value: 'blue'
      };
      const res = toEncodingQuery(valueDef, 'color');
      expect(res).toEqual({
        channel: 'color',
        value: 'blue'
      });
    });
  });

  describe('toValueQuery', () => {
    it('should return a valid ValueQuery', () => {
      const valueDef: ValueDef = {
        value: 'blue'
      };
      const res = toValueQuery(valueDef, 'color');
      expect(res).toEqual({
        channel: 'color',
        value: 'blue'
      });
    });
  });

  describe('fromValueQuery', () => {
    it('throws error for wildcard value', () => {
      const fieldQuery: ValueQuery = {
        value: '?',
        channel: '?',
        description: ''
      };
      expect(() => fromValueQuery(fieldQuery)).toThrowError('Voyager does not support wildcard value');
    });

    it('should return valueDef', () => {
      const fieldQuery: ValueQuery = {
        description: '',
        channel: 'color',
        value: 'blue'
      };
      expect(fromValueQuery(fieldQuery)).toEqual({
        value: 'blue'
      });
    });
  });

  describe('isShelfFieldDef', () => {
    it('should return true given ShelfFieldDef', () => {
      const fieldDef: ShelfFieldDef = {
        field: '?'
      };
      expect(isShelfFieldDef(fieldDef)).toEqual(true);
    });

    it('should return false given ShelfValueDef', () => {
      const valueDef: ShelfValueDef = {
        value: 'blue'
      };
      expect(isShelfFieldDef(valueDef)).toEqual(false);
    });
  });

  describe('isShelfValueDef', () => {
    it('should return true given ShelfValueDef', () => {
      const valueDef: ShelfValueDef = {
        value: 'blue'
      };
      expect(isShelfValueDef(valueDef)).toEqual(true);
    });

    it('should return false given ShelfFieldDef', () => {
      const fieldDef: ShelfFieldDef = {
        field: '?'
      };
      expect(isShelfValueDef(fieldDef)).toEqual(false);
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
