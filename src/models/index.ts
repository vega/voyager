import {UnitShelf, DEFAULT_SHELF_SPEC} from './shelf';
export * from './shelf';

export interface State {
  shelf: UnitShelf;
}

export const DEFAULT_STATE: State = {
  shelf: DEFAULT_SHELF_SPEC
};
