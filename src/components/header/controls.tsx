import * as React from 'react';
import * as CSSModules from 'react-css-modules';
// import { Bookmark } from './bookmark';
import * as styles from './controls.scss';
import { UndoRedo } from './undo-redo';

class ControlsBase extends React.Component<any, any> {
  public render() {
    return (
      <div styleName='controls'>
        {/*<Bookmark/>*/}
        <UndoRedo/>
      </div>
    );
  }
}

export const Controls = CSSModules(ControlsBase, styles);
