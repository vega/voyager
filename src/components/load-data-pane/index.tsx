import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as styles from './load-data-pane.scss';

export class LoadDataBase extends React.PureComponent<{}, {}> {
  public render() {
    return (
      <div className="pane" styleName="load-data-pane">
        Please add a dataset
      </div>
    );
  }
}

export const LoadData = CSSModules(LoadDataBase, styles);
