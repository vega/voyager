import {LOG_ERROR_CHANGE, LOG_ERROR_REMOVE, LOG_WARNINGS_ADD, LOG_WARNINGS_REMOVE} from '../actions/log';
import {DEFAULT_LOG, Log} from '../models/log';
import {logReducer} from './log';

const simpleLog: Log = {
  warnings: ['warning 1', 'warning 2'],
  error: 'error'
};

describe('reducers/log', () => {
  describe(LOG_ERROR_CHANGE, () => {
    it('should add an error to the existing log', () => {
      const error = 'this is an error';
      expect(logReducer(DEFAULT_LOG, {
        type: LOG_ERROR_CHANGE,
        payload: {
          error
        }
      })).toEqual({
        ...DEFAULT_LOG,
        error
      });
    });
  });

  describe(LOG_WARNINGS_ADD, () => {
    it('should add warnings to the existing log', () => {
      const warnings = ['this is the first warning', 'this is the second warning'];
      expect(logReducer(DEFAULT_LOG, {
        type: LOG_WARNINGS_ADD,
        payload: {
          warnings
        }
      })).toEqual({
        ...DEFAULT_LOG,
        warnings,
      });
    });
  });

  describe(LOG_WARNINGS_REMOVE, () => {
    it('should remove all warnings in the existing log', () => {
      expect(logReducer(simpleLog, {
        type: LOG_WARNINGS_REMOVE
      })).toEqual({
        ...simpleLog,
        warnings: []
      });
    });
  });

  describe(LOG_ERROR_REMOVE, () => {
    it('should remove error in the existing log', () => {
      expect(logReducer(simpleLog, {
        type: LOG_ERROR_REMOVE
      })).toEqual({
        ...simpleLog,
        error: null
      });
    });
  });
});
