import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as styles from './warnings.scss';

export interface WarningsProps {
  warnings: any[];
}

class WarningsBase extends React.Component<WarningsProps, {}> {
  public render() {
    const {warnings} = this.props;

    return (
      <div styleName='warning-pane'>
        {warnings}
      </div>
    );
  }
}


export const Warnings = CSSModules(WarningsBase, styles);
