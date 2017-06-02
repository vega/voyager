import {StateWithHistory} from 'redux-undo';

import {DEFAULT_VOYAGER_CONFIG, VoyagerConfig} from './config';
import {Dataset, DEFAULT_DATASET} from './dataset';
import {DEFAULT_RESULT, ResultIndex} from './result';
import {DEFAULT_SHELF_SPEC, Shelf} from './shelf';

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
export type State = StateWithHistory<StateBase>;

export const DEFAULT_STATE: StateBase = {
  config: DEFAULT_VOYAGER_CONFIG,
  dataset: DEFAULT_DATASET,
  shelf: DEFAULT_SHELF_SPEC,
  result: DEFAULT_RESULT,
};
