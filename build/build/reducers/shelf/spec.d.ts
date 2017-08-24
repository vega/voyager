import { Schema } from 'compassql/build/src/schema';
import { FieldDef } from 'vega-lite/build/src/fielddef';
import { Action } from '../../actions';
import { ShelfAnyEncodingDef, ShelfFieldDef, ShelfUnitSpec } from '../../models/shelf';
export declare function shelfSpecReducer(shelfSpec: Readonly<ShelfUnitSpec>, action: Action, schema: Schema): Readonly<ShelfUnitSpec>;
export declare type AnyFieldDef = ShelfFieldDef | ShelfAnyEncodingDef | FieldDef<any>;
export declare function modifyFieldProp(fieldDef: Readonly<AnyFieldDef>, prop: string, value: any): Readonly<AnyFieldDef>;
export declare function modifyNestedFieldProp(fieldDef: Readonly<AnyFieldDef>, prop: string, nestedProp: string, value: any): Readonly<AnyFieldDef>;
