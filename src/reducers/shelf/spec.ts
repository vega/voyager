import {getTopSpecQueryItem} from 'compassql/build/src/model';
import {fromSpec} from 'compassql/build/src/query/spec';
import {recommend} from 'compassql/build/src/recommend';
import {Schema} from 'compassql/build/src/schema';
import {isWildcard, SHORT_WILDCARD} from 'compassql/build/src/wildcard';


import {Action} from '../../actions';
import {
  SHELF_CLEAR, SHELF_FIELD_ADD, SHELF_FIELD_AUTO_ADD, SHELF_FIELD_MOVE,
  SHELF_FIELD_REMOVE, SHELF_FUNCTION_ADD_WILDCARD, SHELF_FUNCTION_CHANGE, SHELF_FUNCTION_DISABLE_WILDCARD,
  SHELF_FUNCTION_ENABLE_WILDCARD, SHELF_FUNCTION_REMOVE_WILDCARD, SHELF_MARK_CHANGE_TYPE, SHELF_SPEC_LOAD
} from '../../actions/shelf';

import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {AGGREGATE_OPS} from 'vega-lite/build/src/aggregate';
import {TIMEUNITS} from 'vega-lite/build/src/timeunit';
import {isWildcardChannelId} from '../../models';
import {ShelfAnyEncodingDef, ShelfFieldDef, ShelfFunction, ShelfId, ShelfUnitSpec} from '../../models/shelf';
import {getSupportedFunction} from '../../models/shelf/encoding';
import {autoAddFieldQuery} from '../../models/shelf/index';
import {DEFAULT_SHELF_UNIT_SPEC, fromSpecQuery} from '../../models/shelf/spec';
import {toSet} from '../../util';
import {insertItemToArray, modifyItemInArray, removeItemFromArray} from '../util';


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

    case SHELF_FUNCTION_ADD_WILDCARD: {
      const {shelfId, fn} = action.payload;

      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        return {
          ...fieldDef,
          ...(getWildcardFunctionsMixins(fn, fieldDef))
        };
      });

    }

    case SHELF_FUNCTION_DISABLE_WILDCARD: {
      const {shelfId} = action.payload;

      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        const {aggregate: _a, bin: _b, timeUnit: _t, hasFn: _h, ...fieldDefWithoutFn} = fieldDef;

        let fn;
        if (fieldDef.bin) {
          fn = 'bin';
        } else if (fieldDef.aggregate && fieldDef.aggregate['enum']) {
          if (fieldDef.aggregate['enum'].length > 0) {
            fn = fieldDef.aggregate['enum'][0];
          }
        } else if (fieldDef.timeUnit && fieldDef.timeUnit['enum']) {
          if (fieldDef.timeUnit['enum'].length > 0) {
            fn = fieldDef.timeUnit['enum'][0];
          }
        }

        return {
          ...fieldDefWithoutFn,
          ...getFunctionMixins(fn)
        };
      });
    }

    case SHELF_FUNCTION_CHANGE: {
      const {shelfId, fn} = action.payload;

      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        // Remove all existing functions then assign new function
        const {aggregate: _a, bin: _b, timeUnit: _t, hasFn: _h, ...fieldDefWithoutFn} = fieldDef;

        return {
          ...fieldDefWithoutFn,
          ...(getFunctionMixins(fn))
        };
      });
    }

    case SHELF_FUNCTION_ENABLE_WILDCARD: {
      const {shelfId, fn} = action.payload;

      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        const {aggregate: _a, bin: _b, timeUnit: _t, hasFn: _h, ...fieldDefWithoutFn} = fieldDef;

        return {
          ...fieldDefWithoutFn,
          ...(getFunctionAsWildcard(fn))
        };
      });
    }

    case SHELF_FUNCTION_REMOVE_WILDCARD: {
      const {shelfId, fn} = action.payload;

      return modifyEncoding(shelfSpec, shelfId, (fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) => {
        let fieldDefWithoutFn = fieldDef;

        if (AGGREGATE_INDEX[fn]) {
          const {aggregate: _a, ...fieldDefWithoutAggregate} = fieldDef;
          fieldDefWithoutFn = fieldDefWithoutAggregate;
        }

        if (fn === 'bin') {
          const {bin: _b, ...fieldDefWithoutBin} = fieldDef;
          fieldDefWithoutFn = fieldDefWithoutBin;
        }

        if (TIMEUNIT_INDEX[fn]) {
          const {timeUnit: _t, ...fieldDefWithoutTimeUnit} = fieldDef;
          fieldDefWithoutFn = fieldDefWithoutTimeUnit;
        }

        return {
          ...fieldDefWithoutFn,
          ...(removeWildcardFunctionsMixins(fn, fieldDef))
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

function getFunctionAsWildcard(fn: ShelfFunction) {
  if (AGGREGATE_INDEX[fn]) {
    return {
      aggregate: {
        name: 'aggregate',
        enum: [fn]
      }
    };
  }

  if (fn === 'bin') {
    return {
      bin: '?'
    };
  }

  if (TIMEUNIT_INDEX[fn]) {
    return {
      timeUnit: {
        name: 'timeUnit',
        enum: [fn]
      }
    };
  }

  return undefined;
}

function buildSupportedFunctionIndex(type: ExpandedType) {
  return getSupportedFunction(type).reduce((dict, fn, currentIndex) => {
    dict[fn] = currentIndex;
    return dict;
  }, {});
}

const aggregateOrderIndex = buildSupportedFunctionIndex('quantitative');
const timeunitOrderIndex = buildSupportedFunctionIndex('temporal');

function sortByTimeunitIndex(a: ExpandedType, b: ExpandedType) {
  return timeunitOrderIndex[a] - timeunitOrderIndex[b];
}

function sortByAggregateIndex(a: ExpandedType, b: ExpandedType) {
  return aggregateOrderIndex[a] - aggregateOrderIndex[b];
}

function removeWildcardFunctionsMixins(fn: ShelfFunction, fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) {
  if (AGGREGATE_INDEX[fn]) {
    const aggregateEnum: string[] = fieldDef.aggregate['enum'];
    return (fieldDef.aggregate['enum'].length > 1) ?
      {
        aggregate: {
          name: 'aggregate',
          enum: aggregateEnum.filter(aggregateWildcardFn => aggregateWildcardFn !== fn)
        }
      } :
      undefined;
  }

  if (TIMEUNIT_INDEX[fn]) {
    const timeUnitEnum: string[] = fieldDef.timeUnit['enum'];
    return (fieldDef.timeUnit['enum'].length > 1) ?
      {
        timeUnit: {
          name: 'timeUnit',
          enum: timeUnitEnum.concat([fn]).filter(timeUnitWildcardFn => timeUnitWildcardFn !== fn)
        }
      } :
      undefined;
  }

  return undefined;
}

function getWildcardFunctionsMixins(fn: ShelfFunction, fieldDef: Readonly<ShelfFieldDef | ShelfAnyEncodingDef>) {
  if (AGGREGATE_INDEX[fn]) {
    return {
      aggregate: {
        name: 'aggregate',
        enum: (fieldDef.aggregate) ?
          fieldDef.aggregate['enum'].concat([fn]).sort(sortByAggregateIndex) :
          [fn]
      }
    };
  }

  if (fn === 'bin') {
    return {bin: '?'};
  }

  if (TIMEUNIT_INDEX[fn]) {
    return {
      timeUnit: {
        name: 'timeUnit',
        enum: (fieldDef.timeUnit) ?
          fieldDef.timeUnit['enum'].concat([fn]).sort(sortByTimeunitIndex) :
          [fn]
      }
    };
  }

  return undefined;
}

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
