import {contains} from 'vega-lite/build/src/util';
import {Action} from '../actions/index';
import {LOG_ERRORS_ADD, LOG_ERRORS_CLEAR, LOG_WARNINGS_ADD, LOG_WARNINGS_CLEAR} from '../actions/log';
import {isSpecAction} from '../actions/shelf/spec';
import {DEFAULT_LOG, Log, WarningLevel} from '../models/log';


export function logReducer(log: Log = DEFAULT_LOG, action: Action): Log {
  if (isSpecAction(action)) {
    return {
      errors: [],
      warnings: {
        warn: [],
        info: [],
        debug: []
      }
    };
  }

  switch (action.type) {
    case LOG_ERRORS_ADD:
      const {errors} = action.payload;
      const newUniqueErrors = errors.filter(error => !contains(log.errors, error));
      if (newUniqueErrors) {
        return {
          ...log,
          errors: log.errors.concat(newUniqueErrors)
        };
      }
      return log;
    case LOG_WARNINGS_ADD:
      const {warnings, level} = action.payload;
      return logWarningsInLevel(log, warnings, level);
    case LOG_WARNINGS_CLEAR:
      return {
        ...log,
        warnings: {
          warn: [],
          info: [],
          debug: []
        }
      };
    case LOG_ERRORS_CLEAR:
      return {
        ...log,
        errors: []
      };
    default:
      return log;
  }
}

function logWarningsInLevel(log: Log, warnings: string[], level: WarningLevel): Log {
  const preWarnings = log.warnings;
  const newUniqueWarnings = warnings.filter(warning => !contains(preWarnings[level], warning));
  if (newUniqueWarnings) {
    return {
      ...log,
      warnings: {
        ...preWarnings,
        [level]: preWarnings[level].concat(newUniqueWarnings)
      }
    };
  }
  return log;
}
