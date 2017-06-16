import {
  Action,
  RESULT_RECEIVE,
  RESULT_REQUEST,
} from '../actions';
import {DEFAULT_RESULT, DEFAULT_RESULT_MAIN, Result, ResultIndex} from '../models';

export function mainResultReducer(state: Readonly<Result> = DEFAULT_RESULT_MAIN, action: Action): Result {
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

export function resultReducer(state: Readonly<ResultIndex> = DEFAULT_RESULT, action: Action) {
  return {
    main: mainResultReducer(state.main, action)
  };
};
