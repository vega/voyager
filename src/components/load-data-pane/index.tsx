import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {DataSelector} from '../data-pane/data-selector';
import * as styles from './load-data-pane.scss';

export class LoadDataBase extends React.PureComponent<{}, {}> {
  public render() {
    return (
      <div className="pane" styleName="load-data-pane">
        Please load a dataset
        {' '}
        <DataSelector title="Load"/>
      </div>
    );
  }
}

export const LoadData = CSSModules(LoadDataBase, styles);
