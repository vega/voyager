import {State} from '../models';
import {ReduxAction} from './redux-action';

export type ApplicationStateAction = SetApplicationState;

export const SET_APPLICATION_STATE = 'SET_APPLICATION_STATE';
export type SetApplicationState = ReduxAction<typeof SET_APPLICATION_STATE, {
  state: Readonly<State>
}>;
