import {
  Action,
  RESULT_RECEIVE,
  RESULT_REQUEST,
} from '../actions';
import {DEFAULT_RESULT, DEFAULT_RESULT_MAIN, Result, ResultIndex} from '../models';

export function resultReducer(state: Readonly<Result> = DEFAULT_RESULT_MAIN, action: Action): Result {
  switch (action.type) {
    case RESULT_REQUEST:
      return {
        ...state,
        isLoading: true,
        modelGroup : null
      };
    case RESULT_RECEIVE:
      const { modelGroup } = action.payload;
      return {
        ...state,
        isLoading: false,
        modelGroup: modelGroup
      };
  }
  return state;
}

export function resultIndexReducer(state: Readonly<ResultIndex> = DEFAULT_RESULT, action: Action): ResultIndex {
  switch (action.type) {
    case RESULT_REQUEST:
    case RESULT_RECEIVE:
      const {resultType} = action.payload;
      return {
        ...state,
        [resultType]: resultReducer(state[resultType], action)
      };
  }
  return state;
}
