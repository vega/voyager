
import {Query} from 'compassql/build/src/query/query';
import {
  RESULT_MODIFY_FIELD_PROP, RESULT_MODIFY_NESTED_FIELD_PROP, RESULT_RECEIVE,
  RESULT_REQUEST, ResultModifyFieldProp, ResultModifyNestedFieldProp
} from '../actions/result';
import {DEFAULT_RESULT_INDEX, ResultIndex} from '../models/result';
import {ResultPlot} from '../models/result/plot';
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

  // FIXME: What to put for required Data?
  describe(RESULT_MODIFY_FIELD_PROP, () => {
    const plots: ResultPlot[] = [{
      fieldInfos: null,
      spec: {
        mark: 'point',
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        },
        data: {
          format: {
            parse: 'auto',
            type: 'json'
          },
          name: 'testName'
        }
      }
    }];
    const resultIndex: ResultIndex = {
      ...DEFAULT_RESULT_INDEX,
      // This is not really sensible state, but just to mock the reset behavior
      summaries: {isLoading: true, plots, query: undefined, limit: 5}
    };
    it('updates the provided result with isLoading = true for a non-main result type', () => {
      const action: ResultModifyFieldProp<'sort'> = {
        type: RESULT_MODIFY_FIELD_PROP,
        payload: {resultType: 'summaries', index: 0, channel: 'x', prop: 'sort', value: 'descending'}
      };
      const newResultIndex = resultIndexReducer(resultIndex, action);
      expect(newResultIndex.summaries.plots[0].spec.encoding.x)
        .toEqual({field: 'a', type: 'quantitative', sort: 'descending'});
    });
  });

  describe(RESULT_MODIFY_FIELD_PROP, () => {
    const plots: ResultPlot[] = [{
      fieldInfos: null,
      spec: {
        mark: 'point',
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        },
        data: {
          format: {
            parse: 'auto',
            type: 'json'
          },
          name: 'testName'
        }
      }
    }];
    const resultIndex: ResultIndex = {
      ...DEFAULT_RESULT_INDEX,
      // This is not really sensible state, but just to mock the reset behavior
      summaries: {isLoading: true, plots, query: undefined, limit: 5}
    };

    it('updates the provided result with isLoading = true for a non-main result type', () => {
      const action: ResultModifyNestedFieldProp<'scale', 'type'> = {
        type: RESULT_MODIFY_NESTED_FIELD_PROP,
        payload: {resultType: 'summaries', index: 0, channel: 'x', prop: 'scale', nestedProp: 'type', value: 'log'}
      };
      const newResultIndex = resultIndexReducer(resultIndex, action);
      expect(newResultIndex.summaries.plots[0].spec.encoding.x)
        .toEqual({field: 'a', type: 'quantitative', scale: {type: 'log'}});
    });
  });
});
