import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {FieldSchema, PrimitiveType, Schema} from 'compassql/build/src/schema';
import {DEFAULT_DATASET} from '../models/dataset';
import {DEFAULT_STATE, DEFAULT_STATE_WITH_HISTORY} from '../models/index';
import {selectData, selectPresetWildcardFields, selectSchema, selectSchemaFieldDefs} from './dataset';

const stateWithSchema = {
  ...DEFAULT_STATE_WITH_HISTORY,
  present: {
    ...DEFAULT_STATE,
    dataset: {
      ...DEFAULT_STATE.dataset,
      schema: new Schema({fields:
        [{
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
        }] as FieldSchema[]
      })
    }
  }
};

describe('selectors/dataset', () => {
  describe('selectData', () => {
    it('selecting data should returns default data', () => {
      expect(selectData(DEFAULT_STATE_WITH_HISTORY)).toBe(DEFAULT_DATASET.data);
    });
  });

  describe('selectSchema', () => {
    it('selecting schema should return the default schema', () => {
      expect(selectSchema(DEFAULT_STATE_WITH_HISTORY)).toBe(DEFAULT_STATE.dataset.schema);
    });
  });

  describe('selectPresetWildcardFields', () => {
    it('should return wildcard fields', () => {
      expect(selectPresetWildcardFields(stateWithSchema)).toEqual(
        [
          {field: '?', title: 'Quantitative Fields', type: ExpandedType.QUANTITATIVE}
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
