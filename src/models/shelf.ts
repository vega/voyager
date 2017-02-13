import {EncodingQuery} from 'compassql/src/query/encoding';
import {SpecQuery} from 'compassql/src/query/spec';
import {SHORT_WILDCARD} from 'compassql/src/wildcard';

import {Channel} from 'vega-lite/src/channel';
import {Config} from 'vega-lite/src/config';
import {Encoding} from 'vega-lite/src/encoding';
import {FieldDef} from 'vega-lite/src/fieldDef';
import {Mark as VLMark} from 'vega-lite/src/mark';


export type ShelfChannel = Channel | SHORT_WILDCARD;
export type ShelfMark = VLMark | SHORT_WILDCARD;
export type ShelfFieldDef = FieldDef;

export type SpecificEncoding = {
  [P in keyof Encoding]: Encoding[P]; // TODO: change Encoding[P] to sub-part of EncodingQuery
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
  anyEncodings: EncodingQuery[];

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
