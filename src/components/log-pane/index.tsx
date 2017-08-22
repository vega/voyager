import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {LOG_ERROR_REMOVE, LOG_WARNINGS_REMOVE, LogAction} from '../../actions/log';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {State} from '../../models/index';
import {Log} from '../../models/log';
import {selectLog} from '../../selectors/index';
import * as styles from './log-pane.scss';

export interface LogPaneProps extends ActionHandler<LogAction> {
  log: Log;
}

export class LogPaneBase extends React.PureComponent<LogPaneProps, {}> {
  public render() {
    const warnings = this.props.log.warnings;
    const error = this.props.log.error;

    const warningPane = warnings.length > 0 ? (
      <div styleName='warning-pane'>
        <a styleName='close' onClick={this.closeWarnings.bind(this)}>x</a>
        <ul>
          {warnings.map((warning, index) => {
            return (
              <li key={index}>{warning}</li>
            );
          })}
        </ul>
      </div>
    ) : null;

    const errorPane = error ? (
      <div styleName='error-pane'>
        <a styleName='close' onClick={this.closeError.bind(this)}>x</a>
        {error}
      </div>
    ) : null;

    return (
      <div>
        {warningPane}
        {errorPane}
      </div>
    );
  }

  protected closeWarnings() {
    this.props.handleAction({
      type: LOG_WARNINGS_REMOVE
    });
  }

  protected closeError() {
    this.props.handleAction({
      type: LOG_ERROR_REMOVE,
    });
  }
}


export const LogPane = connect(
  (state: State) => {
    return {
      log: selectLog(state)
    };
  }, createDispatchHandler<LogAction>())(CSSModules(LogPaneBase, styles));
