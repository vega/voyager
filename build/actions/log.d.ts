import { WarningLevel } from '../models/log';
import { PlainReduxAction, ReduxAction } from './redux-action';
export declare type LogAction = LogErrorsAdd | LogWarningsAdd | LogWarningsClear | LogErrorsRemove;
export declare const LOG_ERRORS_ADD = "LOG_ERRORS_ADD";
export declare type LogErrorsAdd = ReduxAction<typeof LOG_ERRORS_ADD, {
    errors: string[];
}>;
export declare const LOG_WARNINGS_ADD = "LOG_WARNINGS_ADD";
export declare type LogWarningsAdd = ReduxAction<typeof LOG_WARNINGS_ADD, {
    warnings: string[];
    level: WarningLevel;
}>;
export declare const LOG_WARNINGS_CLEAR = "LOG_WARNINGS_CLEAR";
export declare type LogWarningsClear = PlainReduxAction<typeof LOG_WARNINGS_CLEAR>;
export declare const LOG_ERRORS_CLEAR = "LOG_ERRORS_CLEAR";
export declare type LogErrorsRemove = PlainReduxAction<typeof LOG_ERRORS_CLEAR>;
