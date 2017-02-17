import {EncodingQuery} from 'compassql/build/src/query/encoding';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {SHORT_WILDCARD, Wildcard, WildcardProperty, isWildcard} from 'compassql/build/src/wildcard';

import {AggregateOp} from 'vega-lite/src/aggregate';
import {Channel} from 'vega-lite/src/channel';
import {Config} from 'vega-lite/src/config';
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
  channel: SHORT_WILDCARD  | Wildcard<Channel>;
}

export type SpecificEncoding = {
  [P in keyof Encoding]: ShelfFieldDef;
};

/**
 * A model state for the shelf.
 * This interface provides a hybrid structure that resembles
 * ExtendedUnitSpec in Vega-Lite and SpecQuery in CompassQL,
 * but provide structure that better serves as internal structure of shelf in Voyager.
 */
export interface UnitShelf {
  // TODO: add other top-level specs.

  mark: ShelfMark;

  // TODO: add transform

  /**
   * Mapping between specific encoding channels and encoding definitions.
   */
  encoding: SpecificEncoding;

  /**
   * List of encodingDef for wildcard channels
   */
  anyEncodings: ShelfAnyEncodingDef[];

  config: Config;
}

export const DEFAULT_SHELF_SPEC: Readonly<UnitShelf> = {
  mark: 'point',
  encoding: {},
  anyEncodings: [],
  config: {}
};

export function toSpecQuery(spec: UnitShelf): SpecQuery {
  return {
    mark: spec.mark,
    encodings: specificEncodingsToEncodingQueries(spec.encoding).concat(spec.anyEncodings),
    config: spec.config
  };
}

function specificEncodingsToEncodingQueries(encoding: SpecificEncoding): EncodingQuery[] {
  const encodings = [];
  // Assemble definition of encodings with specific channels first
  for (const channel in encoding) {
    if (encoding.hasOwnProperty(channel)) {
      encodings.push({
        channel,
        ...(encoding[channel])
      });
    }
  }
  return encodings;
}
