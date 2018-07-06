import { SpecQuery } from 'compassql/build/src/query/spec';
import { Config } from 'vega-lite';
import { ShelfAnyEncodingDef, ShelfMark, SpecificEncoding } from './encoding';
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
export declare function toSpecQuery(spec: ShelfUnitSpec): SpecQuery;
export declare function fromSpecQuery(spec: SpecQuery, oldConfig?: Config): ShelfUnitSpec;
export interface HasWildcard {
    hasAnyWildcard: boolean;
    hasWildcardField: boolean;
    hasWildcardFn: boolean;
    hasWildcardChannel: boolean;
}
export declare function hasWildcards(spec: SpecQuery): HasWildcard;
export declare const DEFAULT_SHELF_UNIT_SPEC: Readonly<ShelfUnitSpec>;
