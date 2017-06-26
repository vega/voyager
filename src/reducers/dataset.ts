import {
  Action,
  DATASET_INLINE_RECEIVE,
  DATASET_SCHEMA_CHANGE_FIELD_TYPE,
  DATASET_URL_RECEIVE,
  DATASET_URL_REQUEST,
} from '../actions';
import {Dataset, DEFAULT_DATASET} from '../models';

import {ExpandedType} from 'compassql/build/src/query/expandedType';
import {FieldSchema, Schema} from 'compassql/build/src/schema';

export function datasetReducer(dataset: Readonly<Dataset> = DEFAULT_DATASET, action: Action): Dataset {
  switch (action.type) {
    case DATASET_URL_REQUEST:
      return {
        ...dataset,
        isLoading: true
      };

    case DATASET_URL_RECEIVE:
      {
        const {name, url, schema} = action.payload;
        return {
          ...dataset,
          isLoading: false,
          name,
          schema,
          data: {url}
        };
      }

    case DATASET_INLINE_RECEIVE:
      {
        const { name, data, schema } = action.payload;
        return {
          ...dataset,
          isLoading: false,
          name,
          schema,
          data,
        };
      }
  }
  return schemaReducer(dataset, action);
}

export function schemaReducer(dataset: Readonly<Dataset> = DEFAULT_DATASET, action: Action) {
  switch (action.type) {
    case DATASET_SCHEMA_CHANGE_FIELD_TYPE:
      const {field, vlType} = action.payload;
      return {
        ...dataset,
        schema: changeFieldType(dataset.schema, field, vlType)
      };
  }
  return dataset;
}

export function changeFieldType(schema: Schema, field: string, vlType: ExpandedType) {
  const changedFieldSchema: FieldSchema = {
    ...schema.fieldSchema(field),
    vlType
  };

  const originalTableSchema = schema.tableSchema();
  const updatedTableSchemaFields: FieldSchema[] = originalTableSchema.fields.map(fieldSchema => {
    if (fieldSchema.name !== field) {
      return fieldSchema;
    }
    return changedFieldSchema;
  });

  return new Schema({
    ...originalTableSchema,
    fields: updatedTableSchemaFields
  });
}
