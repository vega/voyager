import {Query} from 'compassql/build/src/query/query';
import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {addCategoricalField, addQuantitativeField, addTemporalField} from './field-suggestions';


describe('queries/field-suggestions', () => {
  describe('addQuantitativeField', () => {
    it('should correctly produce a query', () => {
      const query: Query = {
        spec: {
          transform: [{
            filter: {
              field: 'a',
              oneOf: ['1, 2']
            }
          }],
          mark: 'point',
          encodings: []
        }
      };
      expect(addQuantitativeField.createQuery(query)).toEqual({
        spec: {
          transform: [{
            filter: {
              field: 'a',
              oneOf: ['1, 2']
            }
          }],
          mark: 'point',
          encodings: [{
            channel: SHORT_WILDCARD,
            bin: SHORT_WILDCARD,
            aggregate: SHORT_WILDCARD,
            field: SHORT_WILDCARD,
            type: 'quantitative',
            description: 'Quantitative Fields'
          }]
        },
        groupBy: 'field',
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        chooseBy: ['aggregationQuality', 'effectiveness'],
        config: {autoAddCount: false}
      });
    });
  });

  describe('addTemporalField', () => {
    it('should correctly produce a query', () => {
      const query: Query = {
        spec: {
          transform: [{
            filter: {
              field: 'a',
              oneOf: ['1, 2']
            }
          }],
          mark: 'point',
          encodings: []
        }
      };
      expect(addTemporalField.createQuery(query)).toEqual({
        spec: {
          transform: [{
            filter: {
              field: 'a',
              oneOf: ['1, 2']
            }
          }],
          mark: 'point',
          encodings: [{
            channel: SHORT_WILDCARD,
            timeUnit: SHORT_WILDCARD,
            hasFn: true,
            field: SHORT_WILDCARD,
            type: 'temporal',
            description: 'Temporal Fields'
          }]
        },
        groupBy: 'field',
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        chooseBy: ['aggregationQuality', 'effectiveness'],
        config: {autoAddCount: false}
      });
    });
  });

  describe('addCategoricalField', () => {
    it('should correctly produce a query', () => {
      const query: Query = {
        spec: {
          transform: [{
            filter: {
              field: 'a',
              oneOf: ['1, 2']
            }
          }],
          mark: 'point',
          encodings: []
        }
      };
      expect(addCategoricalField.createQuery(query)).toEqual({
        spec: {
          transform: [{
            filter: {
              field: 'a',
              oneOf: ['1, 2']
            }
          }],
          mark: 'point',
          encodings: [{
            channel: SHORT_WILDCARD,
            field: SHORT_WILDCARD,
            type: 'nominal',
            description: 'Categorical Fields'
          }]
        },
        groupBy: 'field',
        orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
        chooseBy: ['aggregationQuality', 'effectiveness'],
        config: {autoAddCount: false}
      });
    });
  });
});
