import {StateWithHistory} from 'redux-undo';

import {Data, DEFAULT_DATA} from './data';
import {DEFAULT_SHELF_SPEC, UnitShelf} from './shelf';


export * from './data';
export * from './shelf';

/**
 * Application state.
 */
export interface StateBase {
  data: Data;
  shelf: UnitShelf;
}

/**
 * Application state (wrapped with redux-undo's StateWithHistory interface).
 */
export type State = StateWithHistory<StateBase>;

export const DEFAULT_STATE: StateBase = {
  data: DEFAULT_DATA,
  shelf: DEFAULT_SHELF_SPEC
};
