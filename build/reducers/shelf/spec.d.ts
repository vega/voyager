import { Schema } from 'compassql/build/src/schema';
import { Action } from '../../actions';
import { ShelfUnitSpec } from '../../models/shelf';
export declare function shelfSpecReducer(shelfSpec: Readonly<ShelfUnitSpec>, action: Action, schema: Schema): ShelfUnitSpec;
