import {Action, SHELF_CLEAR, SHELF_FIELD_ADD, SHELF_FIELD_REMOVE, SHELF_MARK_CHANGE_TYPE} from '../actions';
import {DEFAULT_SHELF_SPEC, isWildcardChannelId, UnitShelf} from '../models';

import {SHORT_WILDCARD} from 'compassql/src/wildcard';

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
      const {shelfId, fieldDef} = action.payload;
      if (isWildcardChannelId(shelfId)) {
        // FIXME take index into account
        return {
          ...shelf,
          anyEncodings: [
            ...shelf.anyEncodings,
            {
              channel: SHORT_WILDCARD,
              ...fieldDef
            }
          ]
        };
      } else {
        return {
          ...shelf,
          encoding: {
            ...shelf.encoding,
            [shelfId.channel]: fieldDef
          }
        };
      }
    }

    case SHELF_FIELD_REMOVE: {
      const shelfId = action.payload;
      if (isWildcardChannelId(shelfId)) {
        const index = shelfId.index;
        return {
          ...shelf,
          anyEncodings: [
            ...shelf.anyEncodings.slice(0, index),
            ...shelf.anyEncodings.slice(index + 1),
          ]
        };
      } else {
        const {[shelfId.channel]: _, ...encoding} = shelf.encoding;
        return {
          ...shelf,
          encoding: encoding
        };
      }
    }
  }
  return shelf;
}
