import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {Controls} from './controls';
import * as styles from './header.scss';

import * as idlLogo from '../../../images/idl-h56.png';
import * as logo from '../../../images/logo.png';

export class HeaderBase extends React.PureComponent<{}, {}> {
  public render() {
    return (
      <div styleName='header'>
        <img styleName='voyager-logo' src={logo}/>
        <Controls />
        <a styleName='idl-logo' onClick={this.openLink}>
          <img src={idlLogo}/>
        </a>
      </div>
    );
  }

  private openLink() {
    window.open('https://idl.cs.washington.edu/');
  }
}

export const Header = CSSModules(HeaderBase, styles);
