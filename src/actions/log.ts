import {PlainReduxAction, ReduxAction} from './redux-action';

export type LogAction = LogErrorChange | LogWarningsAdd | LogWarningsRemove | LogErrorRemove;

export const LOG_ERROR_CHANGE = 'LOG_ERROR_CHANGE';
export type LogErrorChange = ReduxAction<typeof LOG_ERROR_CHANGE, {
  error: string
}>;

export const LOG_WARNINGS_ADD = 'LOG_WARNINGS_ADD';
export type LogWarningsAdd = ReduxAction<typeof LOG_WARNINGS_ADD, {
  warnings: string[]
}>;

export const LOG_WARNINGS_REMOVE = 'LOG_WARNINGS_REMOVE';
export type LogWarningsRemove = PlainReduxAction<typeof LOG_WARNINGS_REMOVE>;

export const LOG_ERROR_REMOVE = 'LOG_ERROR_REMOVE';
export type LogErrorRemove = PlainReduxAction<typeof LOG_ERROR_REMOVE>;
