import {VoyagerConfig} from '../models/config';
import {ReduxAction} from './redux-action';

export type ConfigAction = SetConfig;

export const SET_CONFIG = 'SET_CONFIG';
export type SetConfig = ReduxAction<typeof SET_CONFIG, {
  config: VoyagerConfig
}>;
