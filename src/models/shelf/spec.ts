import {EncodingQuery, isValueQuery} from 'compassql/build/src/query/encoding';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {isWildcard, isWildcardDef, SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {Config} from 'vega-lite/build/src/config';
import {fromEncodingQueries, ShelfAnyEncodingDef, ShelfMark, SpecificEncoding} from './encoding';


/**
 * A model state for the shelf of a unit specification.
 * This interface provides a hybrid structure that resembles
 * FacetedUnitSpec in Vega-Lite and SpecQuery in CompassQL,
 * but provide structure that better serves as internal structure of shelf in Voyager.
 */
export interface ShelfUnitSpec {
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


export function toSpecQuery(spec: ShelfUnitSpec): SpecQuery {
  return {
    mark: spec.mark,
    encodings: specificEncodingsToEncodingQueries(spec.encoding).concat(spec.anyEncodings),
    config: spec.config
  };
}

export function fromSpecQuery(spec: SpecQuery, oldConfig?: Config): ShelfUnitSpec {
  const {mark, encodings, config} = spec;

  if (isWildcardDef(mark)) {
    throw new Error('Voyager 2 does not support custom wildcard mark yet');
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
    }
    if (encQ.autoCount === false) {
      continue;
    }

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
  return {
    hasAnyWildcard: hasWildcardChannel || hasWildcardField || hasWildcardFn,
    hasWildcardField,
    hasWildcardFn,
    hasWildcardChannel
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

export const DEFAULT_SHELF_UNIT_SPEC: Readonly<ShelfUnitSpec> = {
  mark: SHORT_WILDCARD,
  encoding: {},
  anyEncodings: [],
  config: {}
};
