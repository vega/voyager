import {SpecQueryGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import {RESULT_RECEIVE, RESULT_REQUEST} from '../actions/result';
import {PlotObject} from '../models/plot';
import {DEFAULT_RESULT_INDEX, ResultIndex} from '../models/result';
import {resultIndexReducer} from './result';

describe('reducers/result', () => {
  describe(RESULT_REQUEST, () => {
    const resultIndex: ResultIndex = {
      ...DEFAULT_RESULT_INDEX,
      // This is not really sensible state, but just to mock the reset behavior
      summaries: {isLoading: true, modelGroup: undefined, query: undefined}
    };
    it('updates the provided result with isLoading = true for a non-main result type', () => {
      expect(resultIndexReducer(resultIndex, {
        type: RESULT_REQUEST,
        payload: {resultType: 'summaries'}
      })).toEqual({
        ...resultIndex,
        summaries: {
          isLoading: true,
          modelGroup: undefined,
          query: undefined
        }
      });
    });

    it('resets the result index and update main result with isLoading = true for main result type', () => {
      expect(resultIndexReducer(resultIndex, {
        type: RESULT_REQUEST,
        payload: {resultType: 'main'}
      })).toEqual({
        ...DEFAULT_RESULT_INDEX,
        main: {
          isLoading: true,
          modelGroup: undefined,
          query: undefined
        }
      });
    });
  });

  describe(RESULT_RECEIVE, () => {
    it('returns new compass state with isLoading=false and new recommends', () => {
      const modelGroup = {} as SpecQueryGroup<PlotObject>; // Mock
      const query = {spec: {}} as Query;

      expect(resultIndexReducer(
        {
          ...DEFAULT_RESULT_INDEX,
          main: {
            isLoading: true,
            modelGroup: undefined,
            query: undefined
          }
        },
        {
          type: RESULT_RECEIVE,
          payload: {
            resultType: 'main',
            modelGroup,
            query // Mock
          }
        }
      )).toEqual({
        ...DEFAULT_RESULT_INDEX,
        main: {
          isLoading: false,
          modelGroup,
          query
        }
      });
    });
  });
});
