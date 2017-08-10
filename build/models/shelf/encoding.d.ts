import { SHORT_WILDCARD, Wildcard, WildcardProperty } from 'compassql/build/src/wildcard';
import { EncodingQuery } from 'compassql/build/src/query/encoding';
import { FieldQuery } from 'compassql/build/src/query/encoding';
import { ExpandedType } from 'compassql/build/src/query/expandedtype';
import { AggregateOp } from 'vega-lite/build/src/aggregate';
import { Channel } from 'vega-lite/build/src/channel';
import { Mark as VLMark } from 'vega-lite/build/src/mark';
import { TimeUnit } from 'vega-lite/build/src/timeunit';
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
    fn?: ShelfFunction;
    type?: ExpandedType;
    title?: string;
}
export declare type ShelfFunction = AggregateOp | 'bin' | TimeUnit | undefined;
export interface ShelfAnyEncodingDef extends ShelfFieldDef {
    channel: SHORT_WILDCARD;
}
export declare type SpecificEncoding = {
    [P in Channel]?: ShelfFieldDef;
};
export declare function fromEncodingQueries(encodings: EncodingQuery[]): {
    encoding: SpecificEncoding;
    anyEncodings: ShelfAnyEncodingDef[];
};
export declare function fromEncodingQuery(encQ: EncodingQuery): ShelfFieldDef;
export declare function toEncodingQuery(fieldDef: ShelfFieldDef, channel: Channel | SHORT_WILDCARD): EncodingQuery;
export declare function toFieldQuery(fieldDef: ShelfFieldDef, channel: Channel | SHORT_WILDCARD): FieldQuery;
export declare function fromFieldQuery(fieldQ: FieldQuery): ShelfFieldDef;
