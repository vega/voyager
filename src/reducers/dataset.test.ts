import {Schema} from 'compassql/build/src/schema';

import {DATASET_URL_RECEIVE, DATASET_URL_REQUEST} from '../actions/dataset';
import {DEFAULT_DATASET} from '../models/dataset';
import {datasetReducer} from './dataset';

describe('reducers/dataset', () => {
  describe(DATASET_URL_REQUEST, () => {
    it('returns new dataset state with isLoading = true', () => {
      expect(datasetReducer(DEFAULT_DATASET, {
        type: DATASET_URL_REQUEST,
        payload: {
          name: 'cars',
          url: 'http://cars.com'
        }
      })).toEqual({
        ...DEFAULT_DATASET,
        isLoading: true
      });
    });
  });

  describe(DATASET_URL_RECEIVE, () => {
    it('returns new dataset state with isLoading=false and with new name, data, and schema', () => {
      const url = 'http://cars.com';
      const schema = {} as Schema; // Mock
      expect(datasetReducer(
        {
          ...DEFAULT_DATASET,
          isLoading: true
        },
        {
          type: DATASET_URL_RECEIVE,
          payload: {
            name: 'cars',
            url,
            schema
          }
        }
      )).toEqual({
        ...DEFAULT_DATASET,
        isLoading: false,
        name: 'cars',
        data: {url},
        schema
      });
    });
  });
});
