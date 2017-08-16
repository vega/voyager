
import {Query} from 'compassql/build/src/query/query';
import {RESULT_RECEIVE, RESULT_REQUEST} from '../actions/result';
import {ResultPlot} from '../models/result';
import {DEFAULT_RESULT_INDEX, ResultIndex} from '../models/result';
import {DEFAULT_LIMIT, resultIndexReducer} from './result';

describe('reducers/result', () => {
  describe(RESULT_REQUEST, () => {
    const resultIndex: ResultIndex = {
      ...DEFAULT_RESULT_INDEX,
      // This is not really sensible state, but just to mock the reset behavior
      summaries: {isLoading: true, plots: undefined, query: undefined, limit: 5}
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
          query: undefined,
          limit: DEFAULT_LIMIT.summaries
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
          query: undefined,
          limit: DEFAULT_LIMIT.main
        }
      });
    });
  });

  describe(RESULT_RECEIVE, () => {
    it('returns new compass state with isLoading=false and new recommends', () => {
      const plots = [{}] as ResultPlot[]; // Mock
      const query = {spec: {}} as Query;

      expect(resultIndexReducer(
        {
          ...DEFAULT_RESULT_INDEX,
          main: {
            isLoading: true,
            plots: undefined,
            query: undefined,
            limit: 25
          }
        },
        {
          type: RESULT_RECEIVE,
          payload: {
            resultType: 'main',
            plots,
            query
          }
        }
      )).toEqual({
        ...DEFAULT_RESULT_INDEX,
        main: {
          isLoading: false,
          plots,
          query,
          limit: 25
        }
      });
    });
  });
});
