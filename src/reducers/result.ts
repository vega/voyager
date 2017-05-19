import {
  Action,
  RESULT_RECOMMENDS_RECEIVE,
  RESULT_RECOMMENDS_REQUEST,
} from '../actions';
import {Result, ResultIndex} from '../models';

export function mainResultReducer(state: Readonly<Result>, action: Action): Result {
  switch (action.type) {
    case RESULT_RECOMMENDS_REQUEST:
      return {
        ...state,
        isLoading: true,
        modelGroup : null
      };
    case RESULT_RECOMMENDS_RECEIVE:
      const { modelGroup } = action.payload;
      return {
        ...state,
        isLoading: false,
        modelGroup: modelGroup
      };
  }
  return state;
}

export function resultReducer(state: Readonly<ResultIndex>, action: Action) {
  return {
    main: mainResultReducer(state.main, action)
  };
};
