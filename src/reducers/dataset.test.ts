import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {FieldSchema, Schema} from 'compassql/build/src/schema';
import {DATASET_RECEIVE, DATASET_REQUEST,
        DATASET_SCHEMA_CHANGE_FIELD_TYPE, DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN} from '../actions/dataset';
import {Dataset, DEFAULT_DATASET} from '../models/dataset';
import {datasetReducer} from './dataset';

describe('reducers/dataset', () => {
  describe(DATASET_REQUEST, () => {
    it('returns new dataset state with isLoading = true', () => {
      expect(datasetReducer(DEFAULT_DATASET, {
        type: DATASET_REQUEST,
        payload: {
          name: 'cars'
        }
      })).toEqual({
        ...DEFAULT_DATASET,
        isLoading: true
      });
    });
  });

  describe(DATASET_RECEIVE, () => {
    it('accepts inline data and returns new dataset state with isLoading=false and new name, data, and schema', () => {
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
          ...DEFAULT_DATASET,
          isLoading: true
        },
        {
          type: DATASET_RECEIVE,
          payload: {
            name: 'Custom Data',
            data,
            schema
          }
        }
      )).toEqual({
        ...DEFAULT_DATASET,
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
