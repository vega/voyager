import {FieldQuery} from 'compassql/build/src/query/encoding';
import {isWildcard, Wildcard} from 'compassql/build/src/wildcard';
import {AGGREGATE_OPS, AggregateOp} from 'vega-lite/build/src/aggregate';
import {TimeUnit, TIMEUNITS} from 'vega-lite/build/src/timeunit';
import {isObject, toSet} from 'vega-util';

export type ShelfFunction = AggregateOp | 'bin' | TimeUnit | undefined;

const AGGREGATE_INDEX = toSet(AGGREGATE_OPS);
const TIMEUNIT_INDEX = toSet(TIMEUNITS);

function isAggregate(fn: ShelfFunction): fn is AggregateOp {
  return AGGREGATE_INDEX[fn];
}

function isTimeUnit(fn: ShelfFunction): fn is TimeUnit {
  return TIMEUNIT_INDEX[fn];
}
export function getFunctionMixins(fn: ShelfFunction | Wildcard<ShelfFunction>) {
  if (isWildcard(fn)) {
    throw Error('fn cannot be a wildcard (yet)');
  } else if (isAggregate(fn)) {
    return {aggregate: fn};
  } else if (fn === 'bin') {
    return {bin: true};
  } else if (isTimeUnit(fn)) {
    return {timeUnit: fn};
  }
  return {};
}

export function fromFieldQueryFunctionMixins(
  fieldQParts: Pick<FieldQuery, 'aggregate' | 'timeUnit' | 'bin' | 'hasFn'>
): ShelfFunction {
  const {aggregate, bin, timeUnit} = fieldQParts;

  let fn: ShelfFunction;
  if (bin) {
    if (isObject(bin)) {
      console.warn('Voyager does not yet support loading VLspec with bin');
    }
    fn = 'bin';
  } else if (aggregate) {
    if (isWildcard(aggregate)) {
      throw Error('Voyager does not support aggregate wildcard (yet)');
    } else {
      fn = aggregate;
    }
  } else if (timeUnit) {
    if (isWildcard(timeUnit)) {
      throw Error('Voyager does not support wildcard timeUnit (yet)');
    } else {
      fn = timeUnit;
    }
  }
  return fn;

}
