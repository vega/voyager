import { EncodingQuery, ValueQuery } from 'compassql/build/src/query/encoding';
import { FieldQuery } from 'compassql/build/src/query/encoding';
import { ExpandedType } from 'compassql/build/src/query/expandedtype';
import { SHORT_WILDCARD, Wildcard, WildcardProperty } from 'compassql/build/src/wildcard';
import { Axis } from 'vega-lite/build/src/axis';
import { Channel, NonPositionScaleChannel, PositionScaleChannel } from 'vega-lite/build/src/channel';
import { ValueDef } from 'vega-lite/build/src/fielddef';
import { Legend } from 'vega-lite/build/src/legend';
import { Mark as VLMark } from 'vega-lite/build/src/mark';
import { Scale } from 'vega-lite/build/src/scale';
import { SortField, SortOrder } from 'vega-lite/build/src/sort';
import { StackOffset } from 'vega-lite/build/src/stack';
import { ShelfFunction } from './function';
export * from './function';
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
export declare type ShelfValueDef = ValueDef;
export declare type ShelfEncodingDef = ShelfFieldDef | ShelfValueDef;
export interface ShelfFieldDef {
    field: WildcardProperty<string>;
    fn?: ShelfFunction | Wildcard<ShelfFunction>;
    scale?: Scale;
    axis?: Axis;
    stack?: StackOffset;
    legend?: Legend;
    sort?: SortOrder | SortField<string>;
    type?: ExpandedType;
    /**
     * Description of a wildcard.
     * This maps directly to the generic "description" property of an EncodingQuery in CompassQL,
     * but in Voyager we only use this property to describe a wildcard.
     */
    description?: string;
}
export interface ShelfAnyEncodingDef extends ShelfFieldDef {
    channel: SHORT_WILDCARD;
}
export declare type SpecificEncoding = {
    [P in PositionScaleChannel]?: ShelfFieldDef;
} & {
    [P in NonPositionScaleChannel]?: ShelfEncodingDef;
} & {
    text?: ShelfEncodingDef;
    detail?: ShelfFieldDef;
    order?: ShelfFieldDef;
    row?: ShelfFieldDef;
    column?: ShelfFieldDef;
};
export declare function fromEncodingQueries(encodings: EncodingQuery[]): {
    encoding: SpecificEncoding;
    anyEncodings: ShelfAnyEncodingDef[];
};
export declare function fromEncodingQuery(encQ: EncodingQuery): ShelfEncodingDef;
export declare function toEncodingQuery(encDef: ShelfEncodingDef, channel: Channel | SHORT_WILDCARD): EncodingQuery;
export declare function toFieldQuery(fieldDef: ShelfFieldDef, channel: Channel | SHORT_WILDCARD): FieldQuery;
export declare function fromFieldQuery(fieldQ: FieldQuery): ShelfFieldDef;
export declare function fromFieldQueryNestedProp<P extends 'scale' | 'axis' | 'legend'>(fieldQ: FieldQuery, prop: P): ShelfFieldDef[P];
export declare function fromValueQuery(encQ: ValueQuery): ShelfValueDef;
export declare function isShelfFieldDef(encDef: any): encDef is ShelfFieldDef;
export declare function isShelfValueDef(encDef: any): encDef is ShelfValueDef;
export declare function toValueQuery(valueDef: ShelfValueDef, channel: Channel | SHORT_WILDCARD): ValueQuery;
