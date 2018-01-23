import {FieldSchema, Schema, TableSchema} from 'compassql/build/src/schema';
import {StateWithHistory} from 'redux-undo';
import {Bookmark, DEFAULT_BOOKMARK} from './bookmark';
import {DEFAULT_VOYAGER_CONFIG, VoyagerConfig} from './config';
import {CustomWildcardField, DEFAULT_CUSTOM_WILDCARD_FIELDS} from './custom-wildcard-field';
import {Dataset, DatasetWithoutSchema, DEFAULT_DATASET} from './dataset';
import {DEFAULT_LOG, Log} from './log';
import {DEFAULT_RELATED_VIEWS, RelatedViews} from './related-views';
import {DEFAULT_SHELF_PREVIEW, ShelfPreview} from './shelf-preview';
import {DEFAULT_TAB, Tab} from './tab';

export * from './bookmark';
export * from './dataset';
export * from './shelf';
export * from './result';
export * from './config';
export * from './tab';

/**
 * Application state.
 */
export interface PersistentState {
  bookmark: Bookmark;
  config: VoyagerConfig;
  log: Log;
  relatedViews: RelatedViews;
  shelfPreview: ShelfPreview;
}

export interface UndoableStateBaseWithoutDataset {
  customWildcardFields: CustomWildcardField[];
  tab: Tab;
}

export interface UndoableStateBase extends UndoableStateBaseWithoutDataset {
  dataset: Dataset;
}

/**
 * Application state (wrapped with redux-undo's StateWithHistory interface).
 */
export interface GenericState<U extends UndoableStateBase> {
  persistent: PersistentState;
  undoable: StateWithHistory<U>;
};

export type State = GenericState<UndoableStateBase>;

export const DEFAULT_UNDOABLE_STATE_BASE: UndoableStateBase = {
  customWildcardFields: DEFAULT_CUSTOM_WILDCARD_FIELDS,
  dataset: DEFAULT_DATASET,
  tab: DEFAULT_TAB,
};

export const DEFAULT_UNDOABLE_STATE: StateWithHistory<UndoableStateBase> = {
  past: [],
  present: DEFAULT_UNDOABLE_STATE_BASE,
  future: [],
  _latestUnfiltered: null,
  group: null,
  index: null,
  limit: 30
};

export const DEFAULT_PERSISTENT_STATE: PersistentState = {
  bookmark: DEFAULT_BOOKMARK,
  config: DEFAULT_VOYAGER_CONFIG,
  log: DEFAULT_LOG,
  relatedViews: DEFAULT_RELATED_VIEWS,
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
    log,
    relatedViews,
    shelfPreview,
    // Then the rest should be UndoableStateBaseWithoutDataset
    ...undoableStateBaseWithoutDataset
  } = serializable;

  const persistent: PersistentState = {bookmark, config, relatedViews, shelfPreview, log};

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
