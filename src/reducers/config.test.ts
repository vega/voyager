import { SET_CONFIG } from '../actions/config';
import { configReducer } from './config';

describe('reducers/config', () => {
  describe(SET_CONFIG, () => {
    it('returns new voyager state with config.showDatasetSelector set to true', () => {
      expect(configReducer(
        {},
        {
          type: SET_CONFIG,
          payload: {
            config: {
              showDataSourceSelector: true
            }
          }
        }
      )).toEqual({
        showDataSourceSelector: true
      });
    });

    it('returns new voyager state with config.showDatasetSelector set to false', () => {
      expect(configReducer(
        {},
        {
          type: SET_CONFIG,
          payload: {
            config: {
              showDataSourceSelector: false
            }
          }
        }
      )).toEqual({
        showDataSourceSelector: false
      });
    });
  });
});
