import {Reducer} from 'redux';
import {Action} from '../actions/index';
import {RESET} from '../actions/reset';

export type ResetIndex<T extends object> = {[K in keyof T]: boolean};

export function makeResetReducer<T extends object>(
  r: Reducer<T>, resetIndex: ResetIndex<T>, defaultValue: T
): Reducer<T> {

  return (state: Readonly<T>, action: Action) => {
    if (action.type === RESET) {
      // Need to cast as object as TS somehow doesn't know that T extends object already
      const newState = {...state as object} as T;
      Object.keys(resetIndex).forEach((key: Extract<keyof T, string>) => {
        newState[key] = defaultValue[key];
      });
      return newState;
    } else {
      return r(state, action);
    }
  };
}
