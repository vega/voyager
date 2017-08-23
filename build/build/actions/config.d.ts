import { VoyagerConfig } from '../models/config';
import { ReduxAction } from './redux-action';
export declare type ConfigAction = SetConfig;
export declare const SET_CONFIG = "SET_CONFIG";
export declare type SetConfig = ReduxAction<typeof SET_CONFIG, {
    config: VoyagerConfig;
}>;
