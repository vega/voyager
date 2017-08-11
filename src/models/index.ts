import {FieldSchema, Schema, TableSchema} from 'compassql/build/src/schema';
import {StateWithHistory} from 'redux-undo';
import {Bookmark, DEFAULT_BOOKMARK} from './bookmark';
import {DEFAULT_VOYAGER_CONFIG, VoyagerConfig} from './config';
import {Dataset, DatasetWithoutSchema, DEFAULT_DATASET} from './dataset';
import {DEFAULT_RESULT_INDEX, ResultIndex} from './result';
import {DEFAULT_SHELF, Shelf} from './shelf';
import {DEFAULT_SHELF_PREVIEW, ShelfPreview} from './shelf-preview';

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
  shelfPreview: ShelfPreview;
}

export interface UndoableStateBaseWithoutDataset {
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
};

export const DEFAULT_UNDOABLE_STATE_BASE: UndoableStateBase = {
  dataset: DEFAULT_DATASET,
  shelf: DEFAULT_SHELF,
  result: DEFAULT_RESULT_INDEX,
};

export const DEFAULT_UNDOABLE_STATE: StateWithHistory<UndoableStateBase> = {
  past: [],
  present: DEFAULT_UNDOABLE_STATE_BASE,
  future: [],
  _latestUnfiltered: null,
  group: null
};

export const DEFAULT_PERSISTENT_STATE: PersistentState = {
  bookmark: DEFAULT_BOOKMARK,
  config: DEFAULT_VOYAGER_CONFIG,
  shelfPreview: DEFAULT_SHELF_PREVIEW
};

export const DEFAULT_STATE: State = {
  persistent: DEFAULT_PERSISTENT_STATE,
  undoable: DEFAULT_UNDOABLE_STATE
};


export interface SerializableState extends PersistentState, UndoableStateBaseWithoutDataset {
  dataset: DatasetWithoutSchema;
  tableschema: TableSchema<FieldSchema>;
}

export function toSerializable(state: Readonly<State>): SerializableState {
  const {dataset, ...undoableStateBaseWithoutDataset} = state.undoable.present;
  const {schema, ...datasetWithoutSchema} = dataset;

  return {
    ...state.persistent,
    ...undoableStateBaseWithoutDataset,
    dataset: datasetWithoutSchema,
    tableschema: schema.tableSchema(),
  };
}

export function fromSerializable(serializable: SerializableState): Readonly<State> {
  const {
    // Data
    dataset: datasetWithoutSchema,
    tableschema,
    // Persistent
    bookmark,
    config,
    shelfPreview,
    // Then the rest should be UndoableStateBaseWithoutDataset
    ...undoableStateBaseWithoutDataset
  } = serializable;

  const persistent: PersistentState = {bookmark, config, shelfPreview};

  const undoableBase: UndoableStateBase = {
    ...undoableStateBaseWithoutDataset,
    dataset: {
      ...datasetWithoutSchema,
      schema : new Schema(serializable.tableschema)
    }
  };

  return {
    persistent,
    undoable: {
      ...DEFAULT_UNDOABLE_STATE,
      present: undoableBase
    }
  };
}
