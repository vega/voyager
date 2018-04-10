import { State } from '../models';
import { ReduxAction } from './redux-action';
export declare type ApplicationStateAction = SetApplicationState;
export declare const SET_APPLICATION_STATE = "SET_APPLICATION_STATE";
export declare type SetApplicationState = ReduxAction<typeof SET_APPLICATION_STATE, {
    state: Readonly<State>;
}>;
