import {EncodingQuery, isAutoCountQuery, isValueQuery} from 'compassql/build/src/query/encoding';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {isWildcard, isWildcardDef, SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {Config} from 'vega-lite/build/src/config';
import {isOneOfFilter, isRangeFilter, OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {FilterTransform, isFilter, Transform} from 'vega-lite/build/src/transform';
import {fromEncodingQueries, ShelfAnyEncodingDef, ShelfMark, SpecificEncoding} from './encoding';

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

  filters: Array<RangeFilter | OneOfFilter>;
}


export function toSpecQuery(spec: ShelfUnitSpec): SpecQuery {
  return {
    mark: spec.mark,
    encodings: specificEncodingsToEncodingQueries(spec.encoding).concat(spec.anyEncodings),
    config: spec.config,
    transform: getTransforms(spec.filters)
  };
}

export function fromSpecQuery(spec: SpecQuery, oldConfig?: Config): ShelfUnitSpec {
  const {mark, encodings, config, transform} = spec;
  if (isWildcardDef(mark)) {
    throw new Error('Voyager 2 does not support custom wildcard mark yet');
  }

  return {
    mark,
    ...fromEncodingQueries(encodings),
    config: config || oldConfig,
    filters: getFilters(transform)
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

export function getFilters(transforms: Transform[]): Array<RangeFilter|OneOfFilter> {
  if (!transforms) {
    return [];
  } else {
    const filters: Array<RangeFilter|OneOfFilter> = [];
    transforms.map(transform => {
      if (!isFilter(transform)) {
        throw new Error('Voyager does not support transforms other than FilterTransform');
      } else if (!isRangeFilter(transform.filter) && !isOneOfFilter(transform.filter)) {
        throw new Error('Voyager does not support filters other than RangeFilter and OneOfFilter');
      }
      filters.push(transform.filter);
    });
    return filters;
  }
}

export function getTransforms(filters: Array<RangeFilter|OneOfFilter>) {
  const transform: FilterTransform[] = [];
  filters.map(filter => {
    transform.push({filter: filter});
  });
  return transform;
}

export const DEFAULT_SHELF_UNIT_SPEC: Readonly<ShelfUnitSpec> = {
  mark: SHORT_WILDCARD,
  encoding: {},
  anyEncodings: [],
  config: {},
  filters: []
};
