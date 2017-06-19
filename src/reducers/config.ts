import {
  Action,
  SET_CONFIG,
} from '../actions';
import {DEFAULT_VOYAGER_CONFIG, VoyagerConfig} from '../models/config';

export function configReducer(state: Readonly<VoyagerConfig> = DEFAULT_VOYAGER_CONFIG, action: Action): VoyagerConfig {
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

