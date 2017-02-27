import * as React from 'react'
import {connect} from 'react-redux';
import {State} from '../../models';
import {UNDO, REDO} from '../../actions/undo-redo';

export interface UndoRedoProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

class UndoRedoBase extends React.PureComponent<UndoRedoProps, any> {
  public render() {
    const {canUndo, canRedo, onUndo, onRedo} = this.props;
    return (
      <p>
        <button onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo}>
          Redo
        </button>
      </p>
    );
  }
}

export const UndoRedo = connect((state: State) => {
  return {
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0
  };
}, (dispatch) => ({
  onUndo() {
    dispatch({type: UNDO});
  },
  onRedo () {
    dispatch({type: REDO});
  }
}))(UndoRedoBase)

