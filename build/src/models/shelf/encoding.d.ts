import { SHORT_WILDCARD, Wildcard, WildcardProperty } from 'compassql/build/src/wildcard';
import { EncodingQuery } from 'compassql/build/src/query/encoding';
import { AggregateOp } from 'vega-lite/build/src/aggregate';
import { Channel } from 'vega-lite/build/src/channel';
import { Encoding } from 'vega-lite/build/src/encoding';
import { Mark as VLMark } from 'vega-lite/build/src/mark';
import { TimeUnit } from 'vega-lite/build/src/timeunit';
import { Type } from 'vega-lite/build/src/type';
/**
 * Identifier of shelf -- either a channel name for non-wildcard channel or
 * index number for wildcard channel.
 */
export declare type ShelfId = ShelfChannelId | ShelfWildcardChannelId;
export interface ShelfChannelId {
    channel: Channel;
}
export interface ShelfWildcardChannelId {
    channel: SHORT_WILDCARD | Wildcard<Channel>;
    index: number;
}
export declare function isWildcardChannelId(shelfId: ShelfId): shelfId is ShelfWildcardChannelId;
export declare type ShelfMark = VLMark | SHORT_WILDCARD;
export interface ShelfFieldDef {
    field: WildcardProperty<string>;
    aggregate?: AggregateOp | Wildcard<AggregateOp>;
    timeUnit?: TimeUnit | Wildcard<TimeUnit>;
    hasFn?: boolean;
    bin?: boolean | SHORT_WILDCARD;
    type?: Type;
    title?: string;
}
export declare type ShelfFunction = AggregateOp | 'bin' | TimeUnit | undefined;
export interface ShelfAnyEncodingDef extends ShelfFieldDef {
    channel: SHORT_WILDCARD | Wildcard<Channel>;
}
export declare type SpecificEncoding = {
    [P in keyof Encoding<string>]: ShelfFieldDef;
};
export declare function fromEncodingQueries(encodings: EncodingQuery[]): {
    encoding: SpecificEncoding;
    anyEncodings: ShelfAnyEncodingDef[];
};
