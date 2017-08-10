import { FieldSchema, TableSchema } from 'compassql/build/src/schema';
import { StateWithHistory } from 'redux-undo';
import { Data } from 'vega-lite/build/src/data';
import { Bookmark } from './bookmark';
import { VoyagerConfig } from './config';
import { Dataset } from './dataset';
import { ResultIndex } from './result';
import { Shelf } from './shelf';
import { ShelfPreview } from './shelf-preview';
export * from './bookmark';
export * from './dataset';
export * from './shelf';
export * from './result';
export * from './config';
/**
 * Application state.
 */
export interface PersistentState {
    bookmark: Bookmark;
    shelfPreview: ShelfPreview;
}
export interface UndoableStateBase {
    config: VoyagerConfig;
    dataset: Dataset;
    shelf: Shelf;
    result: ResultIndex;
}
/**
 * Application state (wrapped with redux-undo's StateWithHistory interface).
 */
export interface State {
    persistent: PersistentState;
    undoable: StateWithHistory<UndoableStateBase>;
}
export declare const DEFAULT_UNDOABLE_STATE_BASE: UndoableStateBase;
export declare const DEFAULT_UNDOABLE_STATE: StateWithHistory<UndoableStateBase>;
export declare const DEFAULT_PERSISTENT_STATE: PersistentState;
export declare const DEFAULT_STATE: State;
export interface SerializableState {
    bookmark: Bookmark;
    config: VoyagerConfig;
    shelf: Shelf;
    shelfPreview: ShelfPreview;
    result: ResultIndex;
    dataset: {
        isLoading: boolean;
        name: string;
        data: Data;
    };
    tableschema: TableSchema<FieldSchema>;
}
export declare function toSerializable(state: Readonly<State>): SerializableState;
export declare function fromSerializable(serializable: SerializableState): Readonly<State>;
