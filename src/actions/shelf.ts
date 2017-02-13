import {ShelfFieldDef, ShelfId, ShelfMark} from '../models';
import { PlainReduxAction, ReduxAction } from './redux-action';

export type ShelfAction =
  ShelfClear |
  ShelfMarkChangeType |
  ShelfEncodingAction;

export type ShelfEncodingAction = ShelfFieldAdd | ShelfFieldRemove;

export const SHELF_CLEAR = 'SHELF_CLEAR';
export type ShelfClear = PlainReduxAction<typeof SHELF_CLEAR>;

export const SHELF_MARK_CHANGE_TYPE = 'SHELF_MARK_CHANGE_TYPE';
export type ShelfMarkChangeType = ReduxAction<typeof SHELF_MARK_CHANGE_TYPE, ShelfMark>;

// Field

export const SHELF_FIELD_ADD = 'SHELF_FIELD_ADD';
export type ShelfFieldAdd = ReduxAction<typeof SHELF_FIELD_ADD, {
  shelfId: ShelfId;
  fieldDef: ShelfFieldDef;
}>;

export const SHELF_FIELD_REMOVE = 'SHELF_FIELD_REMOVE';
export type ShelfFieldRemove = ReduxAction<typeof SHELF_FIELD_REMOVE, ShelfId>;

// TODO: add ShelfMoveField
