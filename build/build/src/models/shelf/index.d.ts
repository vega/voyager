import { Query } from 'compassql/build/src/query/query';
import { ShelfFieldDef } from './encoding';
import { ShelfUnitSpec } from './spec';
export * from './encoding';
export * from './spec';
export declare const DEFAULT_SHELF_SPEC: Readonly<Shelf>;
export interface Shelf {
    spec: ShelfUnitSpec;
    specPreview: ShelfUnitSpec;
}
export declare const DEFAULT_ORDER_BY: string[];
export declare const DEFAULT_CHOOSE_BY: string[];
export declare function toQuery(shelf: Shelf): Query;
export declare function autoAddFieldQuery(shelf: ShelfUnitSpec, fieldDef: ShelfFieldDef): Query;
