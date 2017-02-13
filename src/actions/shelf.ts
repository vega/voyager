import {ShelfChannel, ShelfFieldDef, ShelfMark} from '../models';

export type ShelfAction =
  ShelfClear |
  ShelfMarkChangeType |
  ShelfFieldAdd | ShelfFieldRemove;

export interface ShelfClear {
  type: 'shelf-reset';
};

// Mark
export interface ShelfMarkChangeType {
  type: 'shelf-mark-change-type';
  mark: ShelfMark;
}

// Field

/**
 * Add field to a shelf
 */
export interface ShelfFieldAdd {
  type: 'shelf-field-add';
  channel: ShelfChannel;
  fieldDef: ShelfFieldDef;
  index?: number;
}

export interface ShelfFieldRemove {
  type: 'shelf-field-remove';
  channel: ShelfChannel;

  index?: number;
}

// TODO: add
// export interface ShelfMoveField {
//   type: 'shelf-move-field';
//   fromChannel: WildcardProperty<Channel>;
// }

// Filter
