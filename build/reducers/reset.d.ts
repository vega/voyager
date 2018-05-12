import { Reducer } from 'redux';
export declare type ResetIndex<T extends object> = {
    [K in keyof T]: boolean;
};
export declare function makeResetReducer<T extends object>(r: Reducer<T>, resetIndex: ResetIndex<T>, defaultValue: T): Reducer<T>;
