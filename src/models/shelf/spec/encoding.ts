
import {EncodingQuery, isAutoCountQuery, isFieldQuery} from 'compassql/build/src/query/encoding';
import {FieldQuery} from 'compassql/build/src/query/encoding';
import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {isWildcard, SHORT_WILDCARD, Wildcard, WildcardProperty} from 'compassql/build/src/wildcard';
import {Axis} from 'vega-lite/build/src/axis';
import {Channel} from 'vega-lite/build/src/channel';
import {Legend} from 'vega-lite/build/src/legend';
import {Mark as VLMark} from 'vega-lite/build/src/mark';
import {Scale} from 'vega-lite/build/src/scale';
import {SortField, SortOrder} from 'vega-lite/build/src/sort';
import {StackOffset} from 'vega-lite/build/src/stack';
import {isBoolean} from 'vega-lite/build/src/util';
import {fromFieldQueryFunctionMixins, ShelfFunction, toFieldQueryFunctionMixins} from './function';

export * from './function';

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

  fn?: ShelfFunction | Wildcard<ShelfFunction>;

  scale?: Scale;
  axis?: Axis;
  stack?: StackOffset;
  legend?: Legend;

  sort?: SortOrder | SortField;

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

export type SpecificEncoding = {
  [P in Channel]?: ShelfFieldDef;
};

export function fromEncodingQueries(encodings: EncodingQuery[]): {
  encoding: SpecificEncoding, anyEncodings: ShelfAnyEncodingDef[]
} {
  return encodings.reduce((encodingMixins, encQ) => {
    if (isWildcard(encQ.channel)) {
      encodingMixins.anyEncodings.push({
        channel: encQ.channel,
        ...fromEncodingQuery(encQ)
      });
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

export function toFieldQuery(fieldDef: ShelfFieldDef, channel: Channel | SHORT_WILDCARD): FieldQuery {
  const {fn, ...fieldDefWithoutFn} = fieldDef;

  return {
    channel,
    ...toFieldQueryFunctionMixins(fn),
    ...fieldDefWithoutFn
  };
}

export function fromFieldQuery(fieldQ: FieldQuery): ShelfFieldDef {
  const {aggregate, bin, hasFn, timeUnit, field, scale, axis, legend, sort, description} = fieldQ;
  let {type} = fieldQ;

  if (isWildcard(type)) {
    throw Error('Voyager does not support wildcard type');
  } else if (type === 'ordinal') {
    console.warn('Voyager does not support ordinal type yet, converting to nominal');
    type = 'nominal';
  }

  const fn = fromFieldQueryFunctionMixins({aggregate, bin, timeUnit, hasFn});

  return {
    ...(fn ? {fn} : {}),
    field,
    // Need to cast as TS2.3 isn't smart about this.
    // Upgrading to TS2.4 would solve this issue but creates other issues instead.
    type: type as ExpandedType,
    ...(sort ? {sort} : {}),
    ...(scale ? {scale: fromFieldQueryNestedProp(fieldQ, 'scale')} : {}),
    ...(axis ? {axis: fromFieldQueryNestedProp(fieldQ, 'axis')} : {}),
    ...(legend ? {legend: fromFieldQueryNestedProp(fieldQ, 'legend')} : {}),
    ...(description ? {description} : {})
  };
}

export function fromFieldQueryNestedProp<P extends 'scale' | 'axis' | 'legend'>(
  fieldQ: FieldQuery, prop: P
): ShelfFieldDef[P] {
  const propQ = fieldQ[prop];
  if (!propQ) {
    return undefined;
  } else if (isWildcard(propQ)) {
    throw Error(`Voyager does not support wildcard ${prop}`);
  } else if (isBoolean(propQ)) {
    throw Error(`Voyager does not support boolean ${prop}`);
  } else {
    Object.keys(propQ).forEach(nestedProp => {
      if (isWildcard(propQ[nestedProp])) {
        throw Error(`Voyager does not support wildcard ${prop} ${nestedProp}`);
      }
    });
  }
  // We already catch all the unsupported types above so here we can just cast
  return propQ as ShelfFieldDef[P];
}
