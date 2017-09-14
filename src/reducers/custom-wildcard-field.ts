
import {toMap} from 'compassql/build/src/util';
import {Action} from '../actions';
import {CUSTOM_WILDCARD_ADD, CUSTOM_WILDCARD_ADD_FIELD, CUSTOM_WILDCARD_MODIFY_DESCRIPTION,
        CUSTOM_WILDCARD_REMOVE, CUSTOM_WILDCARD_REMOVE_FIELD} from '../actions/custom-wildcard-field';
import {CustomWildcardFieldDef} from '../models/custom-wildcard-field';
import {insertItemToArray, modifyItemInArray, removeItemFromArray} from './util';

function modifyFieldsProperty(fields: string[]) {
  return (customWildcardFieldDef: CustomWildcardFieldDef) => {
    return {
      ...customWildcardFieldDef,
      field: {
        enum: fields
      }
    };
  };
}

export function customWildcardFieldReducer(
  customWildcardFieldDefs: Readonly<CustomWildcardFieldDef[]> = [],
  action: Action
): CustomWildcardFieldDef[] {
  switch (action.type) {
    case CUSTOM_WILDCARD_ADD: {
      const {fields, type} = action.payload;

      let index = action.payload.index;
      if (!index) {
        index = customWildcardFieldDefs.length;
      }

      return insertItemToArray(customWildcardFieldDefs, index, {
        field: {
          enum: fields
        },
        type,
        description: null
      });
    }

    case CUSTOM_WILDCARD_REMOVE: {
      const {index} = action.payload;
      return removeItemFromArray(customWildcardFieldDefs, index).array;
    }

    case CUSTOM_WILDCARD_ADD_FIELD: {
      const {index, fields} = action.payload;

      const originalFields: string[] = customWildcardFieldDefs[index].field.enum;
      const originalFieldsIndex = toMap(originalFields);
      const addedFields: string[] = fields.filter(field => !originalFieldsIndex[field]);

      if (addedFields.length > 0) {
        return modifyItemInArray(customWildcardFieldDefs, index, modifyFieldsProperty(
          originalFields.concat(addedFields)
        ));
      }

      return customWildcardFieldDefs;
    }

    case CUSTOM_WILDCARD_REMOVE_FIELD: {
      const {index, field} = action.payload;
      const originalFields: string[] = customWildcardFieldDefs[index].field.enum;

      if (originalFields.length > 1) {
        const updatedFields = originalFields.filter(originalField => originalField !== field);
        return modifyItemInArray(customWildcardFieldDefs, index, modifyFieldsProperty(updatedFields));
      } else {
        return removeItemFromArray(customWildcardFieldDefs, index).array;
      }
    }

    case CUSTOM_WILDCARD_MODIFY_DESCRIPTION: {
      const {index, description} = action.payload;
      const modifyTitle = (customWildcardFieldDef: CustomWildcardFieldDef) => {
        return {
          ...customWildcardFieldDef,
          description
        };
      };
      return modifyItemInArray(customWildcardFieldDefs, index, modifyTitle);
    }
  }

  return customWildcardFieldDefs;
}
