import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {CUSTOM_WILDCARD_ADD, CUSTOM_WILDCARD_ADD_FIELD, CUSTOM_WILDCARD_MODIFY_DESCRIPTION,
        CUSTOM_WILDCARD_REMOVE, CUSTOM_WILDCARD_REMOVE_FIELD} from '../actions/custom-wildcard-field';
import {CustomWildcardField} from '../models/custom-wildcard-field';
import {customWildcardFieldReducer} from './custom-wildcard-field';

describe('reducers/custom-wildcard-field', () => {
  describe(CUSTOM_WILDCARD_ADD, () => {
    it('should return a custom wildcard field array containing one custom wildcard field', () => {
      const noCustomWildcardFields: CustomWildcardField[] = [];
      const customWildcardFields = customWildcardFieldReducer(
        noCustomWildcardFields,
        {
          type: CUSTOM_WILDCARD_ADD,
          payload: {
            fields: ['acceleration', 'horsepower'],
            type: ExpandedType.QUANTITATIVE
          }
        }
      );

      expect(customWildcardFields).toEqual([
        {
          fields: ['acceleration', 'horsepower'],
          type: ExpandedType.QUANTITATIVE,
          description: null
        }
      ]);
    });
  });

  const customWildcardFields: CustomWildcardField[] = [
    {
      fields: ['acceleration', 'horsepower'],
      type: ExpandedType.QUANTITATIVE,
      description: null
    }
  ];

  describe(CUSTOM_WILDCARD_REMOVE, () => {
    it('should return remove the specified custom wildcard field from the array', () => {

      const customWildcardFieldsAfterRemove = customWildcardFieldReducer(
        customWildcardFields,
        {
          type: CUSTOM_WILDCARD_REMOVE,
          payload: {
            index: 0
          }
        }
      );

      expect(customWildcardFieldsAfterRemove).toEqual([]);
    });
  });

  describe(CUSTOM_WILDCARD_ADD_FIELD, () => {
    it('should correctly modify the fields property of a custom wildcard field when a ' +
       'preset wildcard field is dragged on top of a custom wildcard field', () => {
      const customWildcardFieldsAfterAddField = customWildcardFieldReducer(
        customWildcardFields,
        {
          type: CUSTOM_WILDCARD_ADD_FIELD,
          payload: {
            index: 0,
            fields: ['acceleration', 'displacement', 'horsepower', 'miles per gallon']
          }
        }
      );

      expect(customWildcardFieldsAfterAddField).toEqual([
        {
          fields: ['acceleration', 'horsepower', 'displacement', 'miles per gallon'],
          type: ExpandedType.QUANTITATIVE,
          description: null
        }
      ]);
    });

    it('should correctly modify the fields property of a custom wildcard field when a ' +
       'single field is dragged on top of a custom wildcard field', () => {
      const customWildcardFieldsAfterAddField = customWildcardFieldReducer(
        customWildcardFields,
        {
          type: CUSTOM_WILDCARD_ADD_FIELD,
          payload: {
            index: 0,
            fields: ['displacement']
          }
        }
      );

      expect(customWildcardFieldsAfterAddField).toEqual([
        {
          fields: ['acceleration', 'horsepower', 'displacement'],
          type: ExpandedType.QUANTITATIVE,
          description: null
        }
      ]);
    });
  });

  describe(CUSTOM_WILDCARD_REMOVE_FIELD, () => {
    it('should remove the field from a custom wildcard field', () => {
      const customWildcardFieldsAfterRemoveField = customWildcardFieldReducer(
        customWildcardFields,
        {
          type: CUSTOM_WILDCARD_REMOVE_FIELD,
          payload: {
            index: 0,
            field: 'acceleration'
          }
        }
      );

      expect(customWildcardFieldsAfterRemoveField).toEqual([
        {
          fields: ['horsepower'],
          type: ExpandedType.QUANTITATIVE,
          description: null
        }
      ]);
    });
  });

  describe(CUSTOM_WILDCARD_MODIFY_DESCRIPTION, () => {
    it('should modify the title of a custom wildcard field', () => {
      const customWildcardFieldsAfterTitleUpdate = customWildcardFieldReducer(
        customWildcardFields,
        {
          type: CUSTOM_WILDCARD_MODIFY_DESCRIPTION,
          payload: {
            index: 0,
            description: 'Custom Q Wildcard'
          }
        }
      );

      expect(customWildcardFieldsAfterTitleUpdate).toEqual([
        {
          fields: ['acceleration', 'horsepower'],
          type: ExpandedType.QUANTITATIVE,
          description: 'Custom Q Wildcard'
        }
      ]);
    });
  });
});
