import {
  Action,
  DATASET_RECEIVE,
  DATASET_REQUEST,
  DATASET_SCHEMA_CHANGE_FIELD_TYPE,
  DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN,
} from '../actions';
import {Dataset, DEFAULT_DATASET} from '../models';

import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {FieldSchema, Schema} from 'compassql/build/src/schema';

export function datasetReducer(dataset: Readonly<Dataset> = DEFAULT_DATASET, action: Action): Dataset {
  switch (action.type) {
    case DATASET_REQUEST: {
      return {
        ...dataset,
        isLoading: true
      };
    }

    case DATASET_RECEIVE: {
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

  const schema = schemaReducer(dataset.schema, action);
  if (dataset.schema !== schema) {
    return {
      ...dataset,
      schema
    };
  } else {
    return dataset;
  }
}

export function schemaReducer(schema = DEFAULT_DATASET.schema, action: Action): Schema {
  switch (action.type) {
    case DATASET_SCHEMA_CHANGE_FIELD_TYPE: {
      const {field, type} = action.payload;
      return changeFieldType(schema, field, type);
    }

    case DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN: {
      const {field, domain} = action.payload;
      return changeOrdinalDomain(schema, field, domain);
    }
  }

  return schema;
}

function updateSchema(schema: Schema, field: string, changedFieldSchema: FieldSchema) {
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

export function changeFieldType(schema: Schema, field: string, type: ExpandedType) {
  return updateSchema(schema, field, {...schema.fieldSchema(field), vlType: type});
}

export function changeOrdinalDomain(schema: Schema, field: string, domain: string[]) {
  return updateSchema(schema, field, {...schema.fieldSchema(field), ordinalDomain: domain});
}
