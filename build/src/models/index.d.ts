import { StateWithHistory } from 'redux-undo';
import { FieldSchema, TableSchema } from 'compassql/build/src/schema';
import { Data } from 'vega-lite/build/src/data';
import { VoyagerConfig } from './config';
import { Dataset } from './dataset';
import { ResultIndex } from './result';
import { Shelf } from './shelf';
export * from './dataset';
export * from './shelf';
export * from './result';
/**
 * Application state.
 */
export interface StateBase {
    config: VoyagerConfig;
    dataset: Dataset;
    shelf: Shelf;
    result: ResultIndex;
}
/**
 * Application state (wrapped with redux-undo's StateWithHistory interface).
 */
export declare type State = StateWithHistory<StateBase>;
export declare const DEFAULT_STATE: StateBase;
export interface SerializableState {
    config: VoyagerConfig;
    shelf: Shelf;
    result: ResultIndex;
    dataset: {
        isLoading: boolean;
        name: string;
        data: Data;
    };
    tableschema: TableSchema<FieldSchema>;
}
export declare function toSerializable(state: Readonly<StateBase>): SerializableState;
export declare function fromSerializable(serializable: SerializableState): Readonly<StateBase>;
