import {EncodingQuery, isAutoCountQuery, isValueQuery} from 'compassql/build/src/query/encoding';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {isWildcard, isWildcardDef, SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {Config} from 'vega-lite';
import {Channel} from 'vega-lite/build/src/channel';
import {
  fromEncodingQueries,
  ShelfAnyEncodingDef,
  ShelfMark,
  SpecificEncoding,
  toEncodingQuery,
  toFieldQuery
} from './encoding';

export * from './encoding';
export * from './function';

/**
 * A model state for the shelf of a unit specification.
 * This interface provides a hybrid structure that resembles
 * FacetedCompositeUnitSpec in Vega-Lite and SpecQuery in CompassQL,
 * but provide structure that better serves as internal structure of shelf in Voyager.
 */
export interface ShelfUnitSpec {
  mark: ShelfMark;

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

export function toSpecQuery(spec: ShelfUnitSpec): SpecQuery {
  const config: Config = spec.config;
  const encodings: EncodingQuery[] = specificEncodingsToEncodingQueries(spec.encoding).concat(spec.anyEncodings.map(
    fd => toEncodingQuery(fd, '?'))) ;
  const mark: ShelfMark = spec.mark;

  return {
    mark,
    encodings,
    config
  };
}

export function fromSpecQuery(spec: SpecQuery, oldConfig?: Config): ShelfUnitSpec {
  const {mark, encodings, config, transform} = spec;
  if (isWildcardDef(mark)) {
    throw new Error('Voyager 2 does not support custom wildcard mark yet');
  }

  if (transform && transform.length > 0) {
    throw new Error('fromSpecQuery should not contain transform');
  }

  return {
    mark,
    ...fromEncodingQueries(encodings),
    config: config || oldConfig
  };
}

export interface HasWildcard {
  hasAnyWildcard: boolean;
  hasWildcardField: boolean;
  hasWildcardFn: boolean;
  hasWildcardChannel: boolean;
}

// FIXME: remove this method and rely on CompassQL's method.
export function hasWildcards(spec: SpecQuery): HasWildcard {
  let hasWildcardField = false, hasWildcardFn = false, hasWildcardChannel = false;
  for (const encQ of spec.encodings) {
    if (isValueQuery(encQ)) {
      continue;
    } else if (isAutoCountQuery(encQ)) {
      if (isWildcard(encQ.autoCount)) {
        hasWildcardFn = true;
      }
    } else { // encQ is FieldQuery
      if (isWildcard(encQ.field)) {
        hasWildcardField = true;
      }

      if (isWildcard(encQ.aggregate) ||
          isWildcard(encQ.bin) ||
          isWildcard(encQ.timeUnit)) {
        hasWildcardFn = true;
      }

      if (isWildcard(encQ.channel)) {
        hasWildcardChannel = true;
      }
    }
  }
  return {
    hasAnyWildcard: hasWildcardChannel || hasWildcardField || hasWildcardFn,
    hasWildcardField,
    hasWildcardFn,
    hasWildcardChannel
  };
}

function specificEncodingsToEncodingQueries(encoding: SpecificEncoding): EncodingQuery[] {
  // Assemble definition of encodings with specific channels first
  return Object.keys(encoding).map((channel: Channel) => {
    return toFieldQuery(encoding[channel], channel);
  });
}


export const DEFAULT_SHELF_UNIT_SPEC: Readonly<ShelfUnitSpec> = {
  mark: SHORT_WILDCARD,
  encoding: {},
  anyEncodings: [],
  config: {}
};
