import {Action} from '../actions/index';
import {LOG_ERROR_CHANGE, LOG_ERROR_REMOVE, LOG_WARNINGS_ADD, LOG_WARNINGS_REMOVE} from '../actions/log';
import {DEFAULT_LOG, Log} from '../models/log';


export function logReducer(log: Log = DEFAULT_LOG, action: Action): Log {
  switch (action.type) {
    case LOG_ERROR_CHANGE:
      const {error} = action.payload;
      return {
        ...log,
        error
      };
    case LOG_WARNINGS_ADD:
      const {warnings} = action.payload;
      return {
        ...log,
        warnings: [...log.warnings, ...warnings]
      };
    case LOG_WARNINGS_REMOVE:
      return {
        ...log,
        warnings: []
      };
    case LOG_ERROR_REMOVE:
      return {
        ...log,
        error: null
      };
    default:
      return log;
  }
}
