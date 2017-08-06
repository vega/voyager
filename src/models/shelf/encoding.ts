
import {isWildcard, SHORT_WILDCARD, Wildcard, WildcardProperty} from 'compassql/build/src/wildcard';

import {EncodingQuery, isAutoCountQuery, isFieldQuery} from 'compassql/build/src/query/encoding';
import {FieldQuery} from 'compassql/build/src/query/encoding';
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {AGGREGATE_OPS, AggregateOp} from 'vega-lite/build/src/aggregate';
import {Channel} from 'vega-lite/build/src/channel';
import {Mark as VLMark} from 'vega-lite/build/src/mark';
import {TimeUnit, TIMEUNITS} from 'vega-lite/build/src/timeunit';
import {isObject, toSet} from '../../util';

/**
 * Identifier of shelf -- either a channel name for non-wildcard channel or
 * index number for wildcard channel.
 */
export type ShelfId = ShelfChannelId | ShelfWildcardChannelId;

export interface ShelfChannelId {
  channel: Channel;
};

export interface ShelfWildcardChannelId {
  channel: SHORT_WILDCARD | Wildcard<Channel>;
  index: number;
};

export function isWildcardChannelId(shelfId: ShelfId): shelfId is ShelfWildcardChannelId {
  return isWildcard(shelfId.channel);
}

export type ShelfMark = VLMark | SHORT_WILDCARD;

export interface ShelfFieldDef {
  field: WildcardProperty<string>;

  fn?: ShelfFunction;

  // | {
  //   [K in ShelfFunction]?: true
  // };

  type?: ExpandedType;

  title?: string;
}

export type ShelfFunction = AggregateOp | TimeUnit | undefined | 'bin';

export interface ShelfAnyEncodingDef extends ShelfFieldDef {
  channel: SHORT_WILDCARD;
}

export type SpecificEncoding = {
  [P in Channel]?: ShelfFieldDef;
};

export function fromEncodingQueries(encodings: EncodingQuery[]): {
  encoding: SpecificEncoding, anyEncodings: ShelfAnyEncodingDef[]
} {
  return encodings.reduce((encodingMixins, encQ) => {
    if (isWildcard(encQ.channel)) {
      encodingMixins.anyEncodings.push({channel: encQ.channel, ...fromEncodingQuery(encQ)});
    } else {
      encodingMixins.encoding[encQ.channel] = fromEncodingQuery(encQ);
    }

    return encodingMixins;
  }, {encoding: {}, anyEncodings: []});
}


export function fromEncodingQuery(encQ: EncodingQuery): ShelfFieldDef {
  if (isFieldQuery(encQ)) {
    return fromFieldQuery(encQ);
  } else if (isAutoCountQuery(encQ)) {
    throw Error('AutoCount Query not yet supported');
  } else {
    throw Error('Value Query not yet supported');
  }
}

export function toEncodingQuery(fieldDef: ShelfFieldDef, channel: Channel | SHORT_WILDCARD): EncodingQuery {
  return toFieldQuery(fieldDef, channel);
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

export function toFieldQuery(fieldDef: ShelfFieldDef, channel: Channel | SHORT_WILDCARD): FieldQuery {
  const {field, fn, type, title: _t} = fieldDef;

  if (isWildcard(fn)) {
    throw Error('fn cannot be a wildcard (yet)');
  }

  return {
    channel: channel,
    field: field,
    type: type,
    ...getFunctionMixins(fn)
  };
}

export function fromFieldQuery(fieldQ: FieldQuery): ShelfFieldDef {
  const {aggregate, bin, timeUnit, field, type} = fieldQ;

  if (isWildcard(type)) {
    throw Error('Voyager does not support wildcard type');
  }

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

  return {field, type, fn: fn};
}
