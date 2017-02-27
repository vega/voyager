import {StateWithHistory} from 'redux-undo';

import {Dataset, DEFAULT_DATASET} from './dataset';
import {DEFAULT_SHELF_SPEC, Shelf} from './shelf';


export * from './dataset';
export * from './shelf';

/**
 * Application state.
 */
export interface StateBase {
  dataset: Dataset;
  shelf: Shelf;
}

/**
 * Application state (wrapped with redux-undo's StateWithHistory interface).
 */
export type State = StateWithHistory<StateBase>;

export const DEFAULT_STATE: StateBase = {
  dataset: DEFAULT_DATASET,
  shelf: DEFAULT_SHELF_SPEC
};
