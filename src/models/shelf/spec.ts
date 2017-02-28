import {EncodingQuery} from 'compassql/build/src/query/encoding';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {Config} from 'vega-lite/src/config';
import {ShelfAnyEncodingDef, ShelfMark, SpecificEncoding} from './encoding';


/**
 * A model state for the shelf of a unit specification.
 * This interface provides a hybrid structure that resembles
 * ExtendedUnitSpec in Vega-Lite and SpecQuery in CompassQL,
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
  mark: 'point',
  encoding: {},
  anyEncodings: [],
  config: {}
};
