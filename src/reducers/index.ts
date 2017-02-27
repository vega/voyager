import undoable from 'redux-undo';

import {Action} from '../actions';
import {StateBase} from '../models';

import {datasetReducer} from './dataset';
import {shelfReducer} from './shelf';
import {UNDO, REDO} from '../actions/undoable';
import {HISTORY_LIMIT} from '../constants';

function reducer(state: Readonly<StateBase>, action: Action): StateBase {
  return {
    dataset: datasetReducer(state.dataset, action),
    shelf: shelfReducer(state.shelf, action)
  };
}

export const rootReducer = undoable(reducer, {
  limit: HISTORY_LIMIT,
  undoType: UNDO,
  redoType: REDO
});
