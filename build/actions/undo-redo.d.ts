import { PlainReduxAction } from './redux-action';
export declare type UndoableAction = Undo | Redo;
export declare const UNDO = "UNDO";
export declare type Undo = PlainReduxAction<typeof UNDO>;
export declare const REDO = "REDO";
export declare type Redo = PlainReduxAction<typeof REDO>;
