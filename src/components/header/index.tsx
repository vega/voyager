import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {Controls} from './controls';
import * as styles from './header.scss';

export class HeaderBase extends React.PureComponent<any, {}> {
  public render() {
    return (
      <div styleName='header'>
        <img styleName='voyager-logo' src={'../../../images/logo.png'}/>
        <Controls />
        <a styleName='idl-logo' href='https://idl.cs.washington.edu/'>
          <img src={'../../../images/idl-h56.png'}/>
        </a>
      </div>
    );
  }
}

export const Header = CSSModules(HeaderBase, styles);
