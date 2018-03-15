export declare type WarningLevel = 'warn' | 'debug' | 'info';
export interface Log {
    errors: string[];
    warnings: {
        warn: string[];
        info: string[];
        debug: string[];
    };
}
export declare const DEFAULT_LOG: Log;
