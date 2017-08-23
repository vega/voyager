import {LOG_ERRORS_ADD, LOG_WARNINGS_ADD, LogAction} from '../../actions/log';

export class Logger {
  private handleAction: (action: LogAction) => void;

  constructor(handleAction: (action: LogAction) => void) {
    this.handleAction = handleAction;
  }

  public level() {
    return this;
  }

  public error(...args: string[]) {
    this.handleAction({
      type: LOG_ERRORS_ADD,
      payload: {
        errors: args
      }
    });
  }

  public warn(...args: string[]) {
    this.handleAction({
      type: LOG_WARNINGS_ADD,
      payload: {
        warnings: args,
        level: 'warn'
      }
    });
    return this;
  }

  public info(...args: string[]) {
    this.handleAction({
      type: LOG_WARNINGS_ADD,
      payload: {
        warnings: args,
        level: 'info'
      }
    });
    return this;
  }

  public debug(...args: string[]) {
    this.handleAction({
      type: LOG_WARNINGS_ADD,
      payload: {
        warnings: args,
        level: 'debug'
      }
    });
    return this;
  }
}
