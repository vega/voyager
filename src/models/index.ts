import {StateWithHistory} from 'redux-undo';

import {Compass, DEFAULT_COMPASS} from './compass';
import {Dataset, DEFAULT_DATASET} from './dataset';
import {DEFAULT_SHELF_SPEC, Shelf} from './shelf';

export * from './dataset';
export * from './shelf';
export * from './compass';

/**
 * Application state.
 */
export interface StateBase {
  dataset: Dataset;
  shelf: Shelf;
  compass: Compass;
}

/**
 * Application state (wrapped with redux-undo's StateWithHistory interface).
 */
export type State = StateWithHistory<StateBase>;

export const DEFAULT_STATE: StateBase = {
  dataset: DEFAULT_DATASET,
  shelf: DEFAULT_SHELF_SPEC,
  compass: DEFAULT_COMPASS,
};
