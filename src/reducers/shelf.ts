import {EncodingQuery} from 'compassql/src/query/encoding';
import {SHORT_WILDCARD} from 'compassql/src/wildcard';

import {Action} from '../actions';
import {
  SHELF_CLEAR, SHELF_FIELD_ADD, SHELF_FIELD_MOVE, SHELF_FIELD_REMOVE, SHELF_MARK_CHANGE_TYPE
} from '../actions/shelf';


import {DEFAULT_SHELF_SPEC, isWildcardChannelId} from '../models';
import {ShelfFieldDef, ShelfId, UnitShelf} from '../models/shelf';

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
      return addEncoding(shelf, shelfId, fieldDef);
    }

    case SHELF_FIELD_REMOVE:
      return removeEncoding(shelf, action.payload).shelf;

    case SHELF_FIELD_MOVE: {
      const {to, from} = action.payload;

      const {fieldDef: fieldDefFrom, shelf: removedShelf1} = removeEncoding(shelf, from);
      const {fieldDef: fieldDefTo, shelf: removedShelf2} = removeEncoding(removedShelf1, to);

      const addedShelf1 = addEncoding(removedShelf2, to, fieldDefFrom);
      const addedShelf2 =  addEncoding(addedShelf1, from, fieldDefTo);

      return addedShelf2;
    }
  }
  return shelf;
}

function addEncoding(shelf: Readonly<UnitShelf>, shelfId: ShelfId, fieldDef: ShelfFieldDef) {
  if (isWildcardChannelId(shelfId)) {
    return {
      ...shelf,
      anyEncodings: insert<EncodingQuery>(shelf.anyEncodings, shelfId.index, {
        channel: SHORT_WILDCARD,
        ...fieldDef
      })
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

function removeEncoding(shelf: Readonly<UnitShelf>, shelfId: ShelfId):
  {fieldDef: ShelfFieldDef, shelf: Readonly<UnitShelf>} {

  if (isWildcardChannelId(shelfId)) {
    const index = shelfId.index;
    const {array: anyEncodings, item} = remove(shelf.anyEncodings, index);

    // Remove channel from the removed EncodingQuery.
    const {channel: _, ...fieldDef} = item;

    return {
      fieldDef,
      shelf: {
        ...shelf,
        anyEncodings
      }
    };
  } else {
    const {[shelfId.channel]: fieldDef, ...encoding} = shelf.encoding;
    return {
      fieldDef,
      shelf: {
        ...shelf,
        encoding: encoding
      }
    };
  }
}

/**
 * Immutable array splice
 */
function remove(array: ReadonlyArray<any>, index: number) {
  return {
    item: array[index],
    array: [
      ...array.slice(0, index),
      ...array.slice(index + 1)
    ]
  };
}

function insert<T>(array: ReadonlyArray<T>, index: number, item: T) {
  return [
    ...array.slice(0, index),
    item,
    ...array.slice(index)
  ];
}
