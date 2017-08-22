import {WarningLevel} from '../models/log';
import {PlainReduxAction, ReduxAction} from './redux-action';

export type LogAction = LogErrorsAdd | LogWarningsAdd | LogWarningsClear | LogErrorsRemove;

export const LOG_ERRORS_ADD = 'LOG_ERRORS_ADD';
export type LogErrorsAdd = ReduxAction<typeof LOG_ERRORS_ADD, {
  errors: string[]
}>;

export const LOG_WARNINGS_ADD = 'LOG_WARNINGS_ADD';
export type LogWarningsAdd = ReduxAction<typeof LOG_WARNINGS_ADD, {
  warnings: string[];
  level: WarningLevel;
}>;

export const LOG_WARNINGS_CLEAR = 'LOG_WARNINGS_CLEAR';
export type LogWarningsClear = PlainReduxAction<typeof LOG_WARNINGS_CLEAR>;

export const LOG_ERRORS_CLEAR = 'LOG_ERRORS_CLEAR';
export type LogErrorsRemove = PlainReduxAction<typeof LOG_ERRORS_CLEAR>;
