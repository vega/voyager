import {FieldSchema, Schema, TableSchema} from 'compassql/build/src/schema';
import {StateWithHistory} from 'redux-undo';
import {Data} from 'vega-lite/build/src/data';
import {Bookmark, DEFAULT_BOOKMARK} from './bookmark';
import {DEFAULT_VOYAGER_CONFIG, VoyagerConfig} from './config';
import {Dataset, DEFAULT_DATASET} from './dataset';
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
};

export const DEFAULT_UNDOABLE_STATE_BASE: UndoableStateBase = {
  config: DEFAULT_VOYAGER_CONFIG,
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
  shelfPreview: DEFAULT_SHELF_PREVIEW
};

export const DEFAULT_STATE: State = {
  persistent: DEFAULT_PERSISTENT_STATE,
  undoable: DEFAULT_UNDOABLE_STATE
};


export interface SerializableState {
  bookmark: Bookmark;
  config: VoyagerConfig;
  shelf: Shelf;
  shelfPreview: ShelfPreview;
  result: ResultIndex;
  dataset: {
    isLoading: boolean;
    name: string;
    data: Data
  };
  tableschema: TableSchema<FieldSchema>;
}

export function toSerializable(state: Readonly<State>): SerializableState {
  const persistentState = state.persistent;
  const undoableState = state.undoable.present;

  return {
    bookmark: persistentState.bookmark,
    config: undoableState.config,
    shelf: undoableState.shelf,
    shelfPreview: persistentState.shelfPreview,
    result: undoableState.result,
    dataset: {
      isLoading: undoableState.dataset.isLoading,
      name: undoableState.dataset.name,
      data: undoableState.dataset.data,
    },
    tableschema: undoableState.dataset.schema.tableSchema(),
  };
}

export function fromSerializable(serializable: SerializableState): Readonly<State> {
  const {bookmark, config, shelf, shelfPreview, result, dataset, tableschema} = serializable;

  return {
    persistent: {
      bookmark,
      shelfPreview
    },

    undoable: {
      past: [],
      present: {
        config,
        dataset: {
          ...dataset,
          schema: new Schema(serializable.tableschema)
        },
        shelf,
        result
      },
      future: [],
      _latestUnfiltered: null,
      group: null
    }
  };
}
