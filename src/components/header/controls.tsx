import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {BookmarkPane} from '../bookmark';
import * as styles from './controls.scss';
import { UndoRedo } from './undo-redo';

export class ControlsBase extends React.PureComponent<{}, {}> {
  public render() {
    return (
      <div styleName='controls'>
        <BookmarkPane/>
        <UndoRedo/>
      </div>
    );
  }
};

export const Controls = CSSModules(ControlsBase, styles);
