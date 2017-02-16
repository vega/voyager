import {ShelfAction} from './shelf';
import {UndoableAction} from './undoable';

export * from './shelf';
export * from './redux-action';

/**
 * Union type of all actions in our application.
 */
export type Action = ShelfAction | UndoableAction;
