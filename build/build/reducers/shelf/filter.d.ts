import { Schema } from 'compassql/build/src/schema';
import { Action } from '../../actions/index';
import { ShelfUnitSpec } from '../../models/shelf/spec';
export declare function filterReducer(shelfSpec: Readonly<ShelfUnitSpec>, action: Action, schema: Schema): ShelfUnitSpec;
