import { FieldSchema, TableSchema } from 'compassql/build/src/schema';
import { StateWithHistory } from 'redux-undo';
import { Bookmark } from './bookmark';
import { VoyagerConfig } from './config';
import { CustomWildcardField } from './custom-wildcard-field';
import { Dataset, DatasetWithoutSchema } from './dataset';
import { Log } from './log';
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
    config: VoyagerConfig;
    log: Log;
    shelfPreview: ShelfPreview;
}
export interface UndoableStateBaseWithoutDataset {
    customWildcardFields: CustomWildcardField[];
    shelf: Shelf;
    result: ResultIndex;
}
export interface UndoableStateBase extends UndoableStateBaseWithoutDataset {
    dataset: Dataset;
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
export interface SerializableState extends PersistentState, UndoableStateBaseWithoutDataset {
    dataset: DatasetWithoutSchema;
    tableschema: TableSchema<FieldSchema>;
}
export declare function toSerializable(state: Readonly<State>): SerializableState;
export declare function fromSerializable(serializable: SerializableState): Readonly<State>;
