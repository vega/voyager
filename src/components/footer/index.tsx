import * as Papa from 'papaparse';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as fileDownload from 'react-file-download';
import {constructLogString} from '../../models/export-logs';
import {actionLogs} from '../../store/index';
import * as styles from './footer.scss';


export class FooterBase extends React.PureComponent<{}, {}> {
  public render() {
    return (
      <div styleName='footer'>
        <a onClick={this.exportLogs}>Download logs</a>
      </div>
    );
  }

  private exportLogs() {
    const logs = constructLogString(actionLogs.getLog().actions);
    const csv = Papa.unparse(logs);
    const fileName = `Logs_voyager_${new Date()}.csv`;
    fileDownload(csv, fileName);
  }
}

export const Footer = CSSModules(FooterBase, styles);
