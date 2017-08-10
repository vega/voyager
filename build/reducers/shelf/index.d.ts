import { Schema } from 'compassql/build/src/schema';
import { Action } from '../../actions';
import { Shelf } from '../../models';
export declare function shelfReducer(shelf: Readonly<Shelf>, action: Action, schema: Schema): Shelf;
