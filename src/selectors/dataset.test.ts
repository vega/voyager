import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {FieldSchema, PrimitiveType, Schema} from 'compassql/build/src/schema';
import {DEFAULT_DATASET} from '../models/dataset';
import {DEFAULT_STATE} from '../models/index';
import {selectData, selectDataset, selectPresetWildcardFields, selectSchema, selectSchemaFieldDefs} from './dataset';

const stateWithSchema = {...DEFAULT_STATE};
stateWithSchema.undoable.present.dataset.schema = new Schema(
  {
    fields: [
      {
        name: 'q1',
        vlType: ExpandedType.QUANTITATIVE,
        type: PrimitiveType.NUMBER,
        stats: {
          distinct: 2
        }
      }, {
        name: 'q2',
        vlType: ExpandedType.QUANTITATIVE,
        type: PrimitiveType.NUMBER,
        stats: {
          distinct: 2
        }
      }
    ] as FieldSchema[]
  });

describe('selectors/dataset', () => {
  describe('selectData', () => {
    it('selecting data should returns default data', () => {
      expect(selectData(DEFAULT_STATE)).toBe(DEFAULT_DATASET.data);
    });
  });

  describe('selectDataset', () => {
    it('selecting dataset should return default dataset', () => {
      expect(selectDataset(DEFAULT_STATE)).toBe(DEFAULT_DATASET);
    });
  });

  describe('selectSchema', () => {
    it('selecting schema should return the default schema', () => {
      expect(selectSchema(DEFAULT_STATE)).toBe(DEFAULT_STATE.undoable.present.dataset.schema);
    });
  });

  describe('selectPresetWildcardFields', () => {
    it('should return wildcard fields', () => {
      expect(selectPresetWildcardFields(stateWithSchema)).toEqual(
        [
          {field: '?', description: 'Quantitative Fields', type: ExpandedType.QUANTITATIVE}
        ]
      );
    });
  });

  describe('selectSchemaFieldDefs', () => {
    it('should return field defs constructed from the given schema', () => {
      expect(selectSchemaFieldDefs(stateWithSchema)).toEqual(
        [
          {field: 'q1', type: ExpandedType.QUANTITATIVE},
          {field: 'q2', type: ExpandedType.QUANTITATIVE}
        ]
      );
    });
  });
});
