import {ShelfAction} from './shelf';
import {UndoableAction} from './undo-redo';

export * from './shelf';
export * from './redux-action';
export * from './undo-redo';

/**
 * Union type of all actions in our application.
 */
export type Action = ShelfAction | UndoableAction;
