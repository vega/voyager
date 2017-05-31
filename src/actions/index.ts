import {ConfigAction} from './config';
import {DatasetAction} from './dataset';
import {ResultAction} from './result';
import {ShelfAction} from './shelf';
import {UndoableAction} from './undo-redo';


export * from './config';
export * from './dataset';
export * from './result';
export * from './redux-action';
export * from './shelf';
export * from './undo-redo';

/**
 * Union type of all actions in our application.
 */
export type Action = DatasetAction | ShelfAction | UndoableAction | ResultAction | ConfigAction;
