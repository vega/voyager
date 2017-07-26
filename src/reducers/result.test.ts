import {SpecQueryGroup} from 'compassql/build/src/model';
import {RESULT_RECEIVE, RESULT_REQUEST} from '../actions/result';
import {PlotObject} from '../models/plot';
import {DEFAULT_RESULT_INDEX} from '../models/result';
import {resultIndexReducer} from './result';

describe('reducers/result', () => {
  describe(RESULT_REQUEST, () => {
    it('returns new compass state with isLoading = true', () => {
      expect(resultIndexReducer(DEFAULT_RESULT_INDEX, {
        type: RESULT_REQUEST,
        payload: {resultType: 'main'}
      })).toEqual({
        ...DEFAULT_RESULT_INDEX,
        main: {
          isLoading: true,
          modelGroup: null
        }
      });
    });
  });

  describe(RESULT_RECEIVE, () => {
    it('returns new compass state with isLoading=false and new recommends', () => {
      const modelGroup = {} as SpecQueryGroup<PlotObject>; // Mock
      expect(resultIndexReducer(
        {
          ...DEFAULT_RESULT_INDEX,
          main: {
            isLoading: true,
            modelGroup: null
          }
        },
        {
          type: RESULT_RECEIVE,
          payload: {
            resultType: 'main',
            modelGroup
          }
        }
      )).toEqual({
        ...DEFAULT_RESULT_INDEX,
        main: {
          isLoading: false,
          modelGroup
        }
      });
    });
  });
});
