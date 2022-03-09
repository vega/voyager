import {LOG_ERRORS_ADD, LOG_WARNINGS_ADD, LogAction} from '../../actions/log';
import {LoggerInterface} from 'vega-util';

export class Logger implements LoggerInterface{
  private handleAction: (action: LogAction) => void;

  constructor(handleAction: (action: LogAction) => void) {
    this.handleAction = handleAction;
  }

  public level(_: number) {
    return this;
  }
  public level(): number {
    return 0;
  }


  public error(...args: any[]) {
    this.handleAction({
      type: LOG_ERRORS_ADD,
      payload: {
        errors: args
      }
    });
    throw Error(...args);
    return this;
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
