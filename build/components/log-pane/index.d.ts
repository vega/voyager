/// <reference types="react" />
import * as React from 'react';
import { LogAction } from '../../actions/log';
import { ActionHandler } from '../../actions/redux-action';
import { Log } from '../../models/log';
export interface LogPaneProps extends ActionHandler<LogAction> {
    log: Log;
}
export declare class LogPaneBase extends React.PureComponent<LogPaneProps, {}> {
    render(): JSX.Element;
    protected closeWarnings(): void;
    protected closeErrors(): void;
    private returnLevelWarnings(warnings, level);
}
export declare const LogPane: React.ComponentClass<{}>;
