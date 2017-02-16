import * as React from 'react';
import {UndoRedo} from './undo-redo';

export class Header extends React.Component<any, {}> {
  public render() {
    return (
      <div className="header">
        Voyager 2
        <UndoRedo/>
      </div>
    );
  }
}
