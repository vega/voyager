
import {toMap} from 'compassql/build/src/util';
import {Action} from '../actions';
import {CUSTOM_WILDCARD_ADD, CUSTOM_WILDCARD_ADD_FIELD, CUSTOM_WILDCARD_MODIFY_DESCRIPTION,
        CUSTOM_WILDCARD_REMOVE, CUSTOM_WILDCARD_REMOVE_FIELD} from '../actions/custom-wildcard-field';
import {CustomWildcardField} from '../models/custom-wildcard-field';
import {insertItemToArray, modifyItemInArray, removeItemFromArray} from './util';

function modifyFieldsProperty(fields: string[]) {
  return (customWildcardField: CustomWildcardField) => {
    return {
      ...customWildcardField,
      fields
    };
  };
}

export function customWildcardFieldReducer(
  customWildcardFields: Readonly<CustomWildcardField[]> = [],
  action: Action
): Readonly<CustomWildcardField[]> {
  switch (action.type) {
    case CUSTOM_WILDCARD_ADD: {
      const {fields, type} = action.payload;

      let index = action.payload.index;
      if (!index) {
        index = customWildcardFields.length;
      }

      return insertItemToArray(customWildcardFields, index, {
        fields,
        type,
        description: null
      });
    }

    case CUSTOM_WILDCARD_REMOVE: {
      const {index} = action.payload;
      return removeItemFromArray(customWildcardFields, index).array;
    }

    case CUSTOM_WILDCARD_ADD_FIELD: {
      const {index, fields} = action.payload;

      const originalFields: string[] = customWildcardFields[index].fields;
      const originalFieldsIndex = toMap(originalFields);
      const addedFields: string[] = fields.filter(field => !originalFieldsIndex[field]);

      if (addedFields.length > 0) {
        return modifyItemInArray(customWildcardFields, index, modifyFieldsProperty(
          originalFields.concat(addedFields)
        ));
      }

      return customWildcardFields;
    }

    case CUSTOM_WILDCARD_REMOVE_FIELD: {
      const {index, field} = action.payload;
      const originalFields: string[] = customWildcardFields[index].fields;
      const updatedFields = originalFields.filter(originalField => originalField !== field);

      return modifyItemInArray(customWildcardFields, index, modifyFieldsProperty(updatedFields));
    }

    case CUSTOM_WILDCARD_MODIFY_DESCRIPTION: {
      const {index, description} = action.payload;
      const modifyTitle = (customWildcardField: CustomWildcardField) => {
        return {
          ...customWildcardField,
          description
        };
      };
      return modifyItemInArray(customWildcardFields, index, modifyTitle);
    }
  }

  return customWildcardFields;
}
