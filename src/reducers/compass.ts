import {
  Action,
  COMPASS_RECOMMENDS_RECEIVE,
  COMPASS_RECOMMENDS_REQUEST,
} from '../actions';
import {Compass} from '../models';

export function compassReducer(state: Readonly<Compass>, action: Action): Compass {
  switch (action.type) {
    case COMPASS_RECOMMENDS_REQUEST:
      return {
        ...state,
        isLoading: true,
        recommends : null
      };
    case COMPASS_RECOMMENDS_RECEIVE:
      const { recommends } = action.payload;
      return {
        ...state,
        isLoading: false,
        recommends
      };
  }
  return state;
}
