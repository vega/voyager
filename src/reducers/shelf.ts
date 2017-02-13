import {Action} from '../actions';
import {DEFAULT_SHELF_SPEC, UnitShelf} from '../models';

import {isWildcard} from 'compassql/src/wildcard';

export function shelfReducer(shelf: Readonly<UnitShelf>, action: Action): UnitShelf {
  switch (action.type) {
    case 'shelf-reset':
      return DEFAULT_SHELF_SPEC;

    case 'shelf-mark-change-type':
      return {
        ...shelf,
        mark: action.mark
      };

    case 'shelf-field-add':
      if (isWildcard(action.channel)) {
        return {
          ...shelf,
          anyEncodings: [
            ...shelf.anyEncodings,
            {
              channel: action.channel,
              ...action.fieldDef
            }
          ]
        };
      } else {
        return {
          ...shelf,
          encoding: {
            ...shelf.encoding,
            [action.channel]: action.fieldDef
          }
        };
      }

    case 'shelf-field-remove':
      if (isWildcard(action.channel)) {
        // FIXME throw error if action.index is not provided.
        return {
          ...shelf,
          anyEncodings: [
            ...shelf.anyEncodings.slice(0, action.index),
            ...shelf.anyEncodings.slice(action.index + 1),
          ]
        };
      } else {
        const {[action.channel]: _, ...encoding} = shelf.encoding;
        return {
          ...shelf,
          encoding: encoding
        };
      }
  }
  return shelf;
}
