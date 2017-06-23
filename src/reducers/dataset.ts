import {
  Action,
  DATASET_INLINE_RECEIVE,
  DATASET_URL_RECEIVE,
  DATASET_URL_REQUEST,
} from '../actions';
import {Dataset, DEFAULT_DATASET} from '../models';

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
  switch (action) {
    // TODO:
      return {
        ...dataset,
        schema: changeFieldType(dataset.schema, /*params: field, type */)
      }
  }
  return dataset;
}

export function changeFieldType(schema: Schema, /*params*/) {
  // read tableSchema

  // do immutable array update for the right one

  return new Schema(updatedTableSchema);
}
