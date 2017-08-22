import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {LOG_ERRORS_CLEAR, LOG_WARNINGS_CLEAR, LogAction} from '../../actions/log';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {State} from '../../models/index';
import {Log, WarningLevel} from '../../models/log';
import {selectLog} from '../../selectors/index';
import * as styles from './log-pane.scss';

export interface LogPaneProps extends ActionHandler<LogAction> {
  log: Log;
}

export class LogPaneBase extends React.PureComponent<LogPaneProps, {}> {
  public render() {
    const warnings = this.props.log.warnings;
    const errors = this.props.log.errors;
    const warningPane = warnings.warn.length > 0 || warnings.debug.length > 0 || warnings.info.length > 0 ? (
      <div styleName='warning-pane'>
        <a styleName='close' onClick={this.closeWarnings.bind(this)}>x</a>
        <ul>
          {this.returnLevelWarnings(warnings, 'warn')}
          {this.returnLevelWarnings(warnings, 'info')}
          {this.returnLevelWarnings(warnings, 'debug')}
        </ul>
      </div>
    ) : null;

    const errorPane = errors.length > 0 ? (
      <div styleName='error-pane'>
        <a styleName='close' onClick={this.closeErrors.bind(this)}>x</a>
        <ul>
          {errors.map((error, index) => {
            return (
              <li key={index}>{error}</li>
            );
          })}
        </ul>
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
      type: LOG_WARNINGS_CLEAR
    });
  }

  protected closeErrors() {
    this.props.handleAction({
      type: LOG_ERRORS_CLEAR,
    });
  }

  private returnLevelWarnings(warnings: {warn: string[], info: string[], debug: string[]},
                              level: WarningLevel): JSX.Element[] {
    return warnings[level].map((warning, index: number) => {
      return (
        <li key={index}>[{level.toUpperCase()}] {warning}</li>
      );
    });
  }
}

export const LogPane = connect(
  (state: State) => {
    return {
      log: selectLog(state)
    };
  }, createDispatchHandler<LogAction>())(CSSModules(LogPaneBase, styles));
