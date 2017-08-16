import {getTopSpecQueryItem} from 'compassql/build/src/model';
import {fromSpec} from 'compassql/build/src/query/spec';
import {recommend} from 'compassql/build/src/recommend';
import {Schema} from 'compassql/build/src/schema';
import {isWildcard, SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {Action} from '../../actions';
import {
  SHELF_CLEAR, SHELF_FIELD_ADD, SHELF_FIELD_AUTO_ADD, SHELF_FIELD_MOVE,
  SHELF_FIELD_REMOVE, SHELF_FUNCTION_CHANGE, SHELF_FUNCTION_ENABLE_WILDCARD,
  SHELF_MARK_CHANGE_TYPE, SHELF_SPEC_LOAD
} from '../../actions/shelf';
import {SHELF_FUNCTION_ADD_WILDCARD, SHELF_FUNCTION_DISABLE_WILDCARD,
        SHELF_FUNCTION_REMOVE_WILDCARD} from '../../actions/shelf';
import {isWildcardChannelId} from '../../models';
import {ShelfAnyEncodingDef, ShelfFieldDef, ShelfId, ShelfUnitSpec} from '../../models/shelf';
import {sortFunctions} from '../../models/shelf/function';
import {autoAddFieldQuery} from '../../models/shelf/index';
import {DEFAULT_SHELF_UNIT_SPEC, fromSpecQuery} from '../../models/shelf/spec';
import {insertItemToArray, modifyItemInArray, removeItemFromArray} from '../util';
import {filterReducer} from './filter';


export function shelfSpecReducer(
  shelfSpec: Readonly<ShelfUnitSpec> = DEFAULT_SHELF_UNIT_SPEC,
  action: Action,
  schema: Schema
): ShelfUnitSpec {
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
      const {shelfId, fieldDef, replace} = action.payload;
      return addEncoding(shelfSpec, shelfId, fieldDef, replace);
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
        const topSpecQuery = getTopSpecQueryItem(rec.result).specQuery;

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

      const addedShelf1 = addEncoding(removedShelf2, to, fieldDefFrom, false);
      const addedShelf2 = addEncoding(addedShelf1, from, fieldDefTo, false);

      return addedShelf2;
    }

    case SHELF_FUNCTION_CHANGE: {
      const {shelfId, fn} = action.payload;

      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        return {
          ...fieldDef,
          fn: fn
        };
      });
    }

    case SHELF_FUNCTION_ADD_WILDCARD: {
      const {shelfId, fn} = action.payload;
      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        const {fn: oldFn, ...fieldDefWithoutFn} = fieldDef;

        return {
          ...fieldDefWithoutFn,
          fn: {
            enum: sortFunctions(oldFn['enum'].concat(fn))
          }
        };
      });
    }

    case SHELF_FUNCTION_DISABLE_WILDCARD: {
      const {shelfId} = action.payload;
      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        const {fn, ...fieldDefWithoutFn} = fieldDef;

        if (isWildcard(fn)) {
          return {
            ...fieldDefWithoutFn,
            ...fn.enum.length > 0 ? {fn: fn.enum[0]} : {}
          };
        } else {
          throw Error('fn must be a wildcard to disable wildcard');
        }
      });
    }

    case SHELF_FUNCTION_ENABLE_WILDCARD: {
      const {shelfId} = action.payload;
      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        const {fn, ...fieldDefWithoutFn} = fieldDef;
        return {
          ...fieldDefWithoutFn,
          fn: {
            enum: [fn]
          }
        };
      });
    }

    case SHELF_FUNCTION_REMOVE_WILDCARD: {
      const {shelfId, fn} = action.payload;
      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        const {fn: oldFn, ...fieldDefWithoutFn} = fieldDef;

        if (isWildcard(oldFn)) {
          return {
            ...fieldDefWithoutFn,
            fn: {
              enum: oldFn.enum.filter(shelfFunc => shelfFunc !== fn)
            }
          };
        } else {
          throw Error('fn must be a wildcard to remove a wildcard');
        }
      });
    }

    case SHELF_SPEC_LOAD:
      const {spec, keepWildcardMark} = action.payload;
      const specQ = {
        ...fromSpec(spec),
        ...(keepWildcardMark && isWildcard(shelfSpec.mark) ? {
          mark: SHORT_WILDCARD
        } : {})
      };

      // Restore wildcard mark if the shelf previously has wildcard mark.
      return fromSpecQuery(specQ, shelfSpec.config);
  }
  return filterReducer(shelfSpec, action, schema);
}

function addEncoding(shelf: Readonly<ShelfUnitSpec>, shelfId: ShelfId, fieldDef: ShelfFieldDef, replace: boolean) {
  if (!fieldDef) {
    return shelf;
  } else if (isWildcardChannelId(shelfId)) {
    const index = shelfId.index;

    if (replace && shelf.anyEncodings[index]) {
      return {
        ...shelf,
        anyEncodings: modifyItemInArray<ShelfAnyEncodingDef>(shelf.anyEncodings, index, () => {
          return {
            channel: SHORT_WILDCARD,
            ...fieldDef
          };
        })
      };
    }

    // insert between two pills (not replace!)
    return {
      ...shelf,
      anyEncodings: insertItemToArray<ShelfAnyEncodingDef>(shelf.anyEncodings, index, {
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
      anyEncodings: modifyItemInArray<ShelfAnyEncodingDef>(shelf.anyEncodings, shelfId.index, modifier)
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
    const {array: anyEncodings, item} = removeItemFromArray(shelf.anyEncodings, index);

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
