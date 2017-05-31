import {
  Action,
  SET_CONFIG,
} from '../actions';
import { VoyagerConfig } from '../components/app';

export function configReducer(state: Readonly<VoyagerConfig>, action: Action): VoyagerConfig {
  switch (action.type) {
    case SET_CONFIG:
      const {config} = action.payload;
      const res = {
        ...state,
        ...config,
      };
      return res;
  }
  return state;
}
