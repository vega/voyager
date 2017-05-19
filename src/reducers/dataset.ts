import {
  Action,
  DATASET_URL_RECEIVE,
  DATASET_URL_REQUEST,
} from '../actions';
import {Dataset} from '../models';
import { DATASET_RECEIVE } from '../actions/dataset';

export function datasetReducer(dataset: Readonly<Dataset>, action: Action): Dataset {
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

    case DATASET_RECEIVE:
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
  return dataset;
}
