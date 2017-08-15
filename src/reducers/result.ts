import {
  Action,
  RESULT_RECEIVE,
  RESULT_REQUEST,
} from '../actions';
import {RESULT_LIMIT_INCREASE} from '../actions/result';
import {DEFAULT_RESULT, DEFAULT_RESULT_INDEX, Result, ResultIndex} from '../models';
import {ResultType} from '../models/result';

export const DEFAULT_LIMIT: {[K in ResultType]: number} = {
  main: 8,
  addCategoricalField: 4,
  addQuantitativeField: 4,
  addTemporalField: 2,
  alternativeEncodings: 2,
  summaries: 2,
  histograms: 12
};

function resultReducer(state: Readonly<Result> = DEFAULT_RESULT, action: Action, resultType: ResultType): Result {
  switch (action.type) {
    case RESULT_REQUEST:
      return {
        ...state,
        isLoading: true,
        plots: undefined,
        query: undefined,
        limit: DEFAULT_LIMIT[resultType]
      };
    case RESULT_RECEIVE:
      const {plots, query} = action.payload;
      return {
        ...state,
        isLoading: false,
        plots,
        query
      };
    case RESULT_LIMIT_INCREASE:
      const {increment} = action.payload;
      return {
        ...state,
        limit: state.limit + increment
      };
  }
  return state;
}

export function resultIndexReducer(state: Readonly<ResultIndex> = DEFAULT_RESULT_INDEX, action: Action): ResultIndex {
  switch (action.type) {
    case RESULT_REQUEST:
    case RESULT_RECEIVE:
    case RESULT_LIMIT_INCREASE:
      const {resultType} = action.payload;
      return {
        ...(
          action.type === RESULT_REQUEST && resultType === 'main' ?
            // When making a main query result request, reset all other results
            // as the older related views results will be outdated anyway.
            DEFAULT_RESULT_INDEX :
            state
        ),
        [resultType]: resultReducer(state[resultType], action, resultType)
      };
  }
  return state;
}
