
import {DatasetAction, DatasetAsyncAction} from './dataset';
import {ShelfAction} from './shelf';
import {UndoableAction} from './undo-redo';

export * from './dataset';
export * from './redux-action';
export * from './shelf';
export * from './undo-redo';

/**
 * Union type of all actions in our application.
 */
export type Action = DatasetAction | ShelfAction | UndoableAction;
