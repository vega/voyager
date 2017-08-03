
import {FieldQuery} from 'compassql/build/src/query/encoding';
import {Query} from 'compassql/build/src/query/query';
import {isWildcard, SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {AGGREGATE_OPS, AggregateOp} from 'vega-lite/build/src/aggregate';
import {TimeUnit, TIMEUNITS} from 'vega-lite/build/src/timeunit';
import {ShelfFunction} from '../../models/shelf';
import {toSet} from '../../util';
import {ShelfFieldDef} from './encoding';
import {DEFAULT_SHELF_UNIT_SPEC, hasWildcards, ShelfUnitSpec, toSpecQuery} from './spec';

export * from './encoding';
export * from './spec';
export const DEFAULT_SHELF_SPEC: Readonly<Shelf> = {
  spec: DEFAULT_SHELF_UNIT_SPEC
};

export interface Shelf {
  spec: ShelfUnitSpec; // TODO: support other type of specs.
  // TODO: support groupBy, autoCount, orderBy
}

export const DEFAULT_ORDER_BY = ['fieldOrder', 'aggregationQuality', 'effectiveness'];
export const DEFAULT_CHOOSE_BY = ['aggregationQuality', 'effectiveness'];

export function toQuery(shelf: Shelf): Query {
  const spec = toSpecQuery(shelf.spec);
  const {hasWildcardField, hasWildcardFn, hasWildcardChannel} = hasWildcards(spec);

  // TODO: support custom groupBy
  const groupBy = hasWildcardFn ? 'fieldTransform' :
    hasWildcardField ? 'field' :
    'encoding';

  return {
    spec: spec,
    groupBy: groupBy,
    orderBy: DEFAULT_ORDER_BY,
    chooseBy: DEFAULT_CHOOSE_BY,
    config: {
      // TODO: support customAutoAddCount
      autoAddCount: (hasWildcardField || hasWildcardFn || hasWildcardChannel)
    }
  };
}

export function autoAddFieldQuery(shelf: ShelfUnitSpec, fieldDef: ShelfFieldDef): Query {
  const spec = toSpecQuery(shelf);

  spec.encodings.push(toFieldQuery(fieldDef));
  return {
    spec,
    chooseBy: 'effectiveness'
    // TODO: customizable config
  };
}

const AGGREGATE_INDEX = toSet(AGGREGATE_OPS);
const TIMEUNIT_INDEX = toSet(TIMEUNITS);

function isAggregate(fn: ShelfFunction): fn is AggregateOp {
  return AGGREGATE_INDEX[fn];
}

function isTimeUnit(fn: ShelfFunction): fn is TimeUnit {
  return TIMEUNIT_INDEX[fn];
}
function getFunctionMixins(fn: ShelfFunction) {
  if (isAggregate(fn)) {
    return {aggregate: fn};
  } else if (fn === 'bin') {
    return {bin: true};
  } else if (isTimeUnit(fn)) {
    return {timeUnit: fn};
  }
  return {};
}

function toFieldQuery(fieldDef: ShelfFieldDef): FieldQuery {
  const {field, fn, type, title: _t} = fieldDef;

  if (isWildcard(fn)) {
    throw Error('fn cannot be a wildcard (yet)');
  }

  return {
    channel: SHORT_WILDCARD,
    field: field,
    type: type,
    ...getFunctionMixins(fn)
  };
}
