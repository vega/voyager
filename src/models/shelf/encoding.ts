
import {isWildcard, SHORT_WILDCARD, Wildcard, WildcardProperty} from 'compassql/build/src/wildcard';

import {EncodingQuery} from 'compassql/build/src/query/encoding';
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {AggregateOp} from 'vega-lite/build/src/aggregate';
import {Channel} from 'vega-lite/build/src/channel';
import {Encoding} from 'vega-lite/build/src/encoding';
import {Mark as VLMark} from 'vega-lite/build/src/mark';
import {TimeUnit} from 'vega-lite/build/src/timeunit';


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

  aggregate?: AggregateOp | Wildcard<AggregateOp>;
  timeUnit?: TimeUnit | Wildcard<TimeUnit>;

  hasFn?: boolean;

  bin?: boolean | SHORT_WILDCARD;

  type?: ExpandedType;

  title?: string;
}

export function functionName(fieldDef: ShelfFieldDef): string {
  const {aggregate, timeUnit, bin} = fieldDef;

  const func = aggregate || timeUnit || bin || undefined;

  if (isWildcard(func)) {
    return '?';
  }
  if (bin) {
    return 'bin';
  }
  return func;
}

export type ShelfFunction = AggregateOp | 'bin' | TimeUnit | undefined;

export interface ShelfAnyEncodingDef extends ShelfFieldDef {
  channel: SHORT_WILDCARD | Wildcard<Channel>;
}

export type SpecificEncoding = {
  [P in keyof Encoding<string>]: ShelfFieldDef;
};

export function fromEncodingQueries(encodings: EncodingQuery[]): {
  encoding: SpecificEncoding, anyEncodings: ShelfAnyEncodingDef[]
} {

  return encodings.reduce((encodingMixins, encQ) => {
    if (isWildcard(encQ.channel)) {
      encodingMixins.anyEncodings.push(encQ);
    } else {
      const {channel: _, ...fieldDef} = encQ;
      encodingMixins.encoding[encQ.channel] = fieldDef;
    }

    return encodingMixins;
  }, {encoding: {}, anyEncodings: []});
}
