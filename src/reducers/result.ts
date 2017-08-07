import {
  Action,
  RESULT_RECEIVE,
  RESULT_REQUEST,
} from '../actions';
import {DEFAULT_RESULT, DEFAULT_RESULT_INDEX, Result, ResultIndex} from '../models';

export function resultReducer(state: Readonly<Result> = DEFAULT_RESULT, action: Action): Result {
  switch (action.type) {
    case RESULT_REQUEST:
      return {
        ...state,
        isLoading: true,
        modelGroup: undefined,
        query: undefined
      };
    case RESULT_RECEIVE:
      const {modelGroup, query} = action.payload;
      return {
        ...state,
        isLoading: false,
        modelGroup,
        query
      };
  }
  return state;
}

export function resultIndexReducer(state: Readonly<ResultIndex> = DEFAULT_RESULT_INDEX, action: Action): ResultIndex {
  switch (action.type) {
    case RESULT_REQUEST:
    case RESULT_RECEIVE:
      const {resultType} = action.payload;
      return {
        ...(
          action.type === RESULT_REQUEST && resultType === 'main' ?
            // When making a main query result request, reset all other results
            // as the older related views results will be outdated anyway.
            DEFAULT_RESULT_INDEX :
            state
        ),
        [resultType]: resultReducer(state[resultType], action)
      };
  }
  return state;
}
