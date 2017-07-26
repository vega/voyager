import {StateWithHistory} from 'redux-undo';

import {FieldSchema, Schema, TableSchema} from 'compassql/build/src/schema';

import {Data} from 'vega-lite/build/src/data';
import {duplicate} from "vega-lite/build/src/util";
import {Bookmark, DEFAULT_BOOKMARK} from './bookmark';
import {DEFAULT_VOYAGER_CONFIG, VoyagerConfig} from './config';
import {Dataset, DEFAULT_DATASET} from './dataset';
import {DEFAULT_RESULT_INDEX, ResultIndex} from './result';
import {DEFAULT_SHELF_SPEC, Shelf} from './shelf';

export * from './bookmark';
export * from './dataset';
export * from './shelf';
export * from './result';
export * from './config';

/**
 * Application state.
 */
export interface StateBase {
  bookmark: Bookmark;
  config: VoyagerConfig;
  dataset: Dataset;
  shelf: Shelf;
  result: ResultIndex;
}

/**
 * Application state (wrapped with redux-undo's StateWithHistory interface).
 */
export type State = StateWithHistory<StateBase>;

export const DEFAULT_STATE: StateBase = {
  bookmark: DEFAULT_BOOKMARK,
  config: DEFAULT_VOYAGER_CONFIG,
  dataset: DEFAULT_DATASET,
  shelf: DEFAULT_SHELF_SPEC,
  result: DEFAULT_RESULT_INDEX,
};

export interface SerializableState {
  bookmark: Bookmark;
  config: VoyagerConfig;
  shelf: Shelf;
  result: ResultIndex;
  dataset: {
    isLoading: boolean;
    name: string;
    data: Data
  };
  tableschema: TableSchema<FieldSchema>;
}

export function toSerializable(state: Readonly<StateBase>): SerializableState {
  const asSerializable = {
    bookmark: state.bookmark,
    config: state.config,
    shelf: state.shelf,
    result: state.result,
    dataset: {
      isLoading: state.dataset.isLoading,
      name: state.dataset.name,
      data: state.dataset.data,
    },
    tableschema: state.dataset.schema.tableSchema(),
  };

  return asSerializable;
}

export function fromSerializable(serializable: SerializableState): Readonly<StateBase> {
  // We make a clone of this object to not modify the input param.
  const deserialized = duplicate(serializable) as any;

  // Add a schema object with a hydrated version of the table schema
  deserialized.dataset.schema = new Schema(deserialized.tableschema);
  delete deserialized.dataset.tableschema;

  return deserialized;
}
