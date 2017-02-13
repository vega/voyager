import {Data, DEFAULT_DATA} from './data';
import {DEFAULT_SHELF_SPEC, UnitShelf} from './shelf';

export * from './data';
export * from './shelf';

export interface State {
  data: Data;
  shelf: UnitShelf;
}

export const DEFAULT_STATE: State = {
  data: DEFAULT_DATA,
  shelf: DEFAULT_SHELF_SPEC
};
