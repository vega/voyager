import {PlainReduxAction} from './redux-action';

export type UndoableAction = Undo | Redo;

export const UNDO = 'UNDO';
export type Undo = PlainReduxAction<typeof UNDO>;

export const REDO = 'REDO';
export type Redo = PlainReduxAction<typeof REDO>;

