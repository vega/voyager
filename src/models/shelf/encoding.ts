
import {isWildcard, SHORT_WILDCARD, Wildcard, WildcardProperty} from 'compassql/build/src/wildcard';

import {AggregateOp} from 'vega-lite/src/aggregate';
import {Channel} from 'vega-lite/src/channel';
import {Encoding} from 'vega-lite/src/encoding';
import {Mark as VLMark} from 'vega-lite/src/mark';
import {TimeUnit} from 'vega-lite/src/timeunit';
import {Type} from 'vega-lite/src/type';


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

  type?: Type;
}

export type ShelfFunction = AggregateOp | 'bin' | TimeUnit | undefined;

export interface ShelfAnyEncodingDef extends ShelfFieldDef {
  channel: SHORT_WILDCARD | Wildcard<Channel>;
}

export type SpecificEncoding = {
  [P in keyof Encoding]: ShelfFieldDef;
};
