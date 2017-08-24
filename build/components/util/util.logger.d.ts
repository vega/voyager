import { LogAction } from '../../actions/log';
export declare class Logger {
    private handleAction;
    constructor(handleAction: (action: LogAction) => void);
    level(): this;
    error(...args: string[]): void;
    warn(...args: string[]): this;
    info(...args: string[]): this;
    debug(...args: string[]): this;
}
