import {VoyagerConfig} from '../components/app';
import {ReduxAction} from './redux-action';

export type ConfigAction = SetConfig;

export const SET_CONFIG = 'SET_CONFIG';
export type SetConfig = ReduxAction<typeof SET_CONFIG, {
  config: VoyagerConfig
}>;

export function setConfig(config: VoyagerConfig): SetConfig {
  return {
    type: SET_CONFIG,
    payload: {
      config,
    }
  };
};
