import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {FieldSchema, Schema} from 'compassql/build/src/schema';

import {DATASET_INLINE_RECEIVE, DATASET_SCHEMA_CHANGE_FIELD_TYPE, DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN,
        DATASET_URL_RECEIVE, DATASET_URL_REQUEST} from '../actions/dataset';
import {Dataset, SAMPLE_DATASET} from '../models/dataset';
import {datasetReducer} from './dataset';

describe('reducers/dataset', () => {
  describe(DATASET_URL_REQUEST, () => {
    it('returns new dataset state with isLoading = true', () => {
      expect(datasetReducer(SAMPLE_DATASET, {
        type: DATASET_URL_REQUEST,
        payload: {
          name: 'cars',
          url: 'http://cars.com'
        }
      })).toEqual({
        ...SAMPLE_DATASET,
        isLoading: true
      });
    });
  });

  describe(DATASET_URL_RECEIVE, () => {
    it('returns new dataset state with isLoading=false and with new name, data, and schema', () => {
      const url = 'http://cars.com';
      const schema = new Schema({fields: []});
      expect(datasetReducer(
        {
          ...SAMPLE_DATASET,
          isLoading: true
        },
        {
          type: DATASET_URL_RECEIVE,
          payload: {
            name: 'cars',
            url,
            schema
          }
        }
      )).toEqual({
        ...SAMPLE_DATASET,
        isLoading: false,
        name: 'cars',
        data: {url},
        schema
      });
    });
  });

  describe(DATASET_INLINE_RECEIVE, () => {
    it('returns new dataset state with isLoading=false and with new name, data, and schema', () => {
      const data = {
        values: [
          {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
          {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
          {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
        ]
      };
      const schema = new Schema({fields: []});
      expect(datasetReducer(
        {
          ...SAMPLE_DATASET,
          isLoading: true
        },
        {
          type: DATASET_INLINE_RECEIVE,
          payload: {
            name: 'Custom Data',
            data,
            schema
          }
        }
      )).toEqual({
        ...SAMPLE_DATASET,
        isLoading: false,
        name: 'Custom Data',
        data,
        schema
      });
    });
  });


  describe(DATASET_SCHEMA_CHANGE_FIELD_TYPE, () => {
    it('returns updated field schema with vlType changed', () => {
      const data = {
        values: [
          {q1: 1},
          {q1: 100}
        ]
      };

      const simpleDataset: Dataset = {
        isLoading: false,
        name: 'Test',
        schema: new Schema({fields:
        [{
          name: 'q1',
          vlType: 'quantitative',
          type: 'number' as any,
          stats: {
            distinct: 2
          }
        }] as FieldSchema[]}),

        data: data
      };

      const changedSchema = new Schema({fields:
        [{
          name: 'q1',
          vlType: 'nominal',
          type: 'number' as any,
          stats: {
            distinct: 2
          }
        }] as FieldSchema[]
      });

      expect(datasetReducer(
        simpleDataset,
        {
          type: DATASET_SCHEMA_CHANGE_FIELD_TYPE,
          payload: {
            field: 'q1',
            type: ExpandedType.NOMINAL
          }
        }
      )).toEqual({
        ...simpleDataset,
        schema: changedSchema
      });
    });
  });

  describe(DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN, () => {
    it('returns updated field schema with ordinalDomain changed', () => {
      const data = {
        values: [
          {o: 'A'},
          {o: 'B'}
        ]
      };

      const simpleDataset: Dataset = {
        isLoading: false,
        name: 'Test',
        schema: new Schema({fields:
        [{
          name: 'o',
          vlType: 'ordinal',
          type: 'string' as any,
          stats: {
            distinct: 2
          }
        }] as FieldSchema[]}),

        data: data
      };

      const changedSchema = new Schema({fields:
        [{
          name: 'o',
          ordinalDomain: ['B', 'A'],
          vlType: 'ordinal',
          type: 'string' as any,
          stats: {
            distinct: 2
          }
        }] as FieldSchema[]
      });

      expect(datasetReducer(
        simpleDataset,
        {
          type: DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN,
          payload: {
            field: 'o',
            domain: ['B', 'A']
          }
        }
      )).toEqual({
        ...simpleDataset,
        schema: changedSchema
      });
    });
  });
});
