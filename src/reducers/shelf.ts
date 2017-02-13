import {Action, SHELF_CLEAR, SHELF_FIELD_ADD, SHELF_FIELD_REMOVE, SHELF_MARK_CHANGE_TYPE} from '../actions';
import {DEFAULT_SHELF_SPEC, UnitShelf} from '../models';

import {isWildcard} from 'compassql/src/wildcard';

export function shelfReducer(shelf: Readonly<UnitShelf>, action: Action): UnitShelf {
  switch (action.type) {
    case SHELF_CLEAR:
      return DEFAULT_SHELF_SPEC;

    case SHELF_MARK_CHANGE_TYPE: {
      const mark = action.payload;
      return {
        ...shelf,
        mark
      };
    }

    case SHELF_FIELD_ADD: {
      const {channel, fieldDef} = action.payload;
      if (isWildcard(channel)) {
        // FIXME take index into account
        return {
          ...shelf,
          anyEncodings: [
            ...shelf.anyEncodings,
            {
              channel: channel,
              ...fieldDef
            }
          ]
        };
      } else {
        return {
          ...shelf,
          encoding: {
            ...shelf.encoding,
            [channel]: fieldDef
          }
        };
      }
    }

    case SHELF_FIELD_REMOVE: {
      const {channel, index} = action.payload;
      if (isWildcard(channel)) {
        // FIXME throw error if action.index is not provided.
        return {
          ...shelf,
          anyEncodings: [
            ...shelf.anyEncodings.slice(0, index),
            ...shelf.anyEncodings.slice(index + 1),
          ]
        };
      } else {
        const {[channel]: _, ...encoding} = shelf.encoding;
        return {
          ...shelf,
          encoding: encoding
        };
      }
    }
  }
  return shelf;
}
