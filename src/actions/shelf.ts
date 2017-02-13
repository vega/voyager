import {SHORT_WILDCARD} from 'compassql/src/wildcard';
import {Channel} from 'vega-lite/src/channel';
import {FieldDef} from 'vega-lite/src/fielddef';
import {Mark} from 'vega-lite/src/mark';

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
  mark: Mark;
}

// Field

/**
 * Add field to a shelf
 */
export interface ShelfFieldAdd {
  type: 'shelf-field-add';
  channel: Channel | SHORT_WILDCARD;
  fieldDef: FieldDef;

  index?: number;
}

export interface ShelfFieldRemove {
  type: 'shelf-field-remove';
  channel: Channel | SHORT_WILDCARD;

  index?: number;
}

// TODO: add
// export interface ShelfMoveField {
//   type: 'shelf-move-field';
//   fromChannel: WildcardProperty<Channel>;
// }

// Filter
