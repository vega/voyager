import { StateWithHistory } from 'redux-undo';
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
