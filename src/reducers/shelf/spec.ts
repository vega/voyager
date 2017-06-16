import {fromSpec} from 'compassql/build/src/query/spec';
import {recommend} from 'compassql/build/src/recommend';
import {Schema} from 'compassql/build/src/schema';
import {isWildcard, SHORT_WILDCARD} from 'compassql/build/src/wildcard';

import {Action} from '../../actions';
import {
  SHELF_CLEAR, SHELF_FIELD_ADD, SHELF_FIELD_AUTO_ADD, SHELF_FIELD_MOVE,
  SHELF_FIELD_REMOVE, SHELF_FUNCTION_CHANGE, SHELF_MARK_CHANGE_TYPE,
  SHELF_SPEC_LOAD
} from '../../actions/shelf';


import {AGGREGATE_OPS} from 'vega-lite/build/src/aggregate';
import {TIMEUNITS} from 'vega-lite/build/src/timeunit';
import {isWildcardChannelId} from '../../models';
import {ShelfAnyEncodingDef, ShelfFieldDef, ShelfFunction, ShelfId, ShelfUnitSpec} from '../../models/shelf';
import {autoAddFieldQuery} from '../../models/shelf/index';
import {DEFAULT_SHELF_UNIT_SPEC, fromSpecQuery} from '../../models/shelf/spec';
import {toSet} from '../../util';


export function shelfSpecReducer(shelfSpec: Readonly<ShelfUnitSpec> = DEFAULT_SHELF_UNIT_SPEC,
                                 action: Action,
                                 schema: Schema): ShelfUnitSpec {
  switch (action.type) {
    case SHELF_CLEAR:
      return DEFAULT_SHELF_UNIT_SPEC;

    case SHELF_MARK_CHANGE_TYPE: {
      const mark = action.payload;
      return {
        ...shelfSpec,
        mark
      };
    }

    case SHELF_FIELD_ADD: {
      const {shelfId, fieldDef} = action.payload;
      return addEncoding(shelfSpec, shelfId, fieldDef);
    }

    case SHELF_FIELD_AUTO_ADD: {
      const {fieldDef} = action.payload;

      if (shelfSpec.anyEncodings.length > 0 || isWildcard(fieldDef.field)) {
        // If there was an encoding shelf or if the field is a wildcard, just add to wildcard shelf
        return {
          ...shelfSpec,
          anyEncodings: [
            ...shelfSpec.anyEncodings,
            {
              channel: SHORT_WILDCARD,
              ...fieldDef
            }
          ]
        };
      } else {
        // Otherwise, query for the best encoding if there is no wildcard channel
        const query = autoAddFieldQuery(shelfSpec, fieldDef);
        const rec = recommend(query, schema);
        const topSpecQuery = rec.result.getTopSpecQueryItem().specQuery;

        return {
          ...fromSpecQuery(topSpecQuery, shelfSpec.config),
          // retain auto-mark if mark is previously auto
          ...(isWildcard(shelfSpec.mark) ? {mark: shelfSpec.mark} : {})
        };
      }
    }

    case SHELF_FIELD_REMOVE:
      return removeEncoding(shelfSpec, action.payload).shelf;

    case SHELF_FIELD_MOVE: {
      const {to, from} = action.payload;

      const {fieldDef: fieldDefFrom, shelf: removedShelf1} = removeEncoding(shelfSpec, from);
      const {fieldDef: fieldDefTo, shelf: removedShelf2} = removeEncoding(removedShelf1, to);

      const addedShelf1 = addEncoding(removedShelf2, to, fieldDefFrom);
      const addedShelf2 = addEncoding(addedShelf1, from, fieldDefTo);

      return addedShelf2;
    }

    case SHELF_FUNCTION_CHANGE: {
      const {shelfId, fn} = action.payload;

      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        // Remove all existing functions then assign new function
        const {aggregate: _a, bin: _b, timeUnit: _t, hasFn: _h, ...newFieldDef} = fieldDef;

        return {
          ...newFieldDef,
          ...(getFunctionMixins(fn))
        };
      });
    }

    case SHELF_SPEC_LOAD:
      const {spec} = action.payload;
      const specQ = isWildcard(shelfSpec.mark) ? {
        ...fromSpec(spec),
        mark: SHORT_WILDCARD
      } : fromSpec(spec);

      // Restore wildcard mark if the shelf previously has wildcard mark.
      return fromSpecQuery(specQ, shelfSpec.config);
  }
  return shelfSpec;
}

const AGGREGATE_INDEX = toSet(AGGREGATE_OPS);
const TIMEUNIT_INDEX = toSet(TIMEUNITS);


function getFunctionMixins(fn: ShelfFunction) {
  if (AGGREGATE_INDEX[fn]) {
    return {aggregate: fn};
  }
  if (fn === 'bin') {
    return {bin: true};
  }
  if (TIMEUNIT_INDEX[fn]) {
    return {timeUnit: fn};
  }
  return undefined;
}

function addEncoding(shelf: Readonly<ShelfUnitSpec>, shelfId: ShelfId, fieldDef: ShelfFieldDef) {
  if (!fieldDef) {
    return shelf;
  } else if (isWildcardChannelId(shelfId)) {
    return {
      ...shelf,
      anyEncodings: insert<ShelfAnyEncodingDef>(shelf.anyEncodings, shelfId.index, {
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

type ShelfFieldDefModifier<T extends ShelfFieldDef> = (fieldDef: Readonly<T>) => T;

function modifyEncoding(shelf: Readonly<ShelfUnitSpec>, shelfId: ShelfId, modifier: ShelfFieldDefModifier<any>) {

  if (isWildcardChannelId(shelfId)) {
    return {
      ...shelf,
      anyEncodings: modify<ShelfAnyEncodingDef>(shelf.anyEncodings, shelfId.index, modifier)
    };
  } else {
    return {
      ...shelf,
      encoding: {
        ...shelf.encoding,
        [shelfId.channel]: modifier(shelf.encoding[shelfId.channel])
      }
    };
  }
}


function removeEncoding(shelf: Readonly<ShelfUnitSpec>, shelfId: ShelfId):
  {fieldDef: ShelfFieldDef, shelf: Readonly<ShelfUnitSpec>} {

  if (isWildcardChannelId(shelfId)) {
    const index = shelfId.index;
    const {array: anyEncodings, item} = remove(shelf.anyEncodings, index);

    if (item) {
      // Remove channel from the removed EncodingQuery if the removed shelf is not empty.
      const {channel: _, ...fieldDef} = item;

      return {
        fieldDef,
        shelf: {
          ...shelf,
          anyEncodings
        }
      };
    } else {
      return {
        fieldDef: undefined,
        shelf: {
          ...shelf,
          anyEncodings
        }
      };
    }
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

function modify<T>(array: ReadonlyArray<T>, index: number, modifier: (t: Readonly<T>) => T) {
  return [
    ...array.slice(0, index),
    modifier(array[index]),
    ...array.slice(index + 1)
  ];
}
