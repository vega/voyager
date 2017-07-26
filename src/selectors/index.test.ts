
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {FieldSchema, PrimitiveType, Schema} from 'compassql/build/src/schema';
import {DEFAULT_BOOKMARK} from '../models/bookmark';
import {DEFAULT_VOYAGER_CONFIG} from '../models/config';
import {DEFAULT_DATASET} from '../models/dataset';
import {DEFAULT_STATE, State} from '../models/index';
import {toQuery} from '../models/shelf/index';
import {selectBookmark, selectConfig, selectData, selectFilters, selectPresetWildcardFields, selectQuery,
  selectSchema, selectSchemaFieldDefs, selectShelf} from './index';

const defaultStateWithHistory: State = {
  past: [],
  present: DEFAULT_STATE,
  future: [],
  _latestUnfiltered: [],
  group: []
};

const stateWithSchema = {
  ...defaultStateWithHistory,
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

describe('selectors/index', () => {
  describe('selectBookmark', () => {
    it('selecting bookmark returns default bookmark', () => {
      expect(selectBookmark(defaultStateWithHistory)).toBe(DEFAULT_BOOKMARK);
    });
  });

  describe('selectConfig', () => {
    it('selecting config should returns default voyager config', () => {
      expect(selectConfig(defaultStateWithHistory)).toBe(DEFAULT_VOYAGER_CONFIG);
    });
  });

  describe('selectData', () => {
    it('selecting data should returns default data', () => {
      expect(selectData(defaultStateWithHistory)).toBe(DEFAULT_DATASET.data);
    });
  });

  describe('selectFilters', () => {
    it('selecting filters should returns an array of filters', () => {
      const filters = [{field: 'q1', range: [0, 1]}];
      const state = {
        ...defaultStateWithHistory,
        present: {
          ...DEFAULT_STATE,
          shelf: {
            ...DEFAULT_STATE.shelf,
            spec: {
              ...DEFAULT_STATE.shelf.spec,
              filters
            }
          }
        }
      };
      expect(selectFilters(state)).toBe(filters);
    });
  });

  describe('selectShelf', () => {
    it('selecting shelf should return the default shelf', () => {
      expect(selectShelf(defaultStateWithHistory)).toBe(DEFAULT_STATE.shelf);
    });
  });

  describe('selectSchema', () => {
    it('selecting schema should return the default schema', () => {
      expect(selectSchema(defaultStateWithHistory)).toBe(DEFAULT_STATE.dataset.schema);
    });
  });

  describe('selectQuery', () => {
    it('selecting query should return the query constructed with default shelf', () => {
      expect(selectQuery(defaultStateWithHistory)).toEqual(toQuery(DEFAULT_STATE.shelf));
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
