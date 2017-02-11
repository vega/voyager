import {SHORT_WILDCARD} from 'compassql/src/wildcard';
import {Channel} from 'vega-lite/src/channel';
import {FieldDef} from 'vega-lite/src/fielddef';
import {Mark} from 'vega-lite/src/mark';

export type ShelfAction =
  ShelfClear |
  ShelfChangeMarkType |
  ShelfFieldAdd | ShelfFieldChannelRemove | ShelfFieldWildcardChannelRemove;

export interface ShelfClear {
  type: 'shelf-reset';
};

// Mark

export interface ShelfChangeMarkType {
  type: 'shelf-change-mark-type';
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
}

export interface ShelfFieldChannelRemove {
  type: 'shelf-field-channel-remove';
  channel: Channel;
}

export interface ShelfFieldWildcardChannelRemove {
  type: 'shelf-field-wildcard-channel-remove';
  index: number;
}

// TODO: add
// export interface ShelfMoveField {
//   type: 'shelf-move-field';
//   fromChannel: WildcardProperty<Channel>;
// }

// Filter
