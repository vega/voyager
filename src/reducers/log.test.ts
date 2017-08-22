import {LOG_ERRORS_ADD, LOG_ERRORS_CLEAR, LOG_WARNINGS_ADD, LOG_WARNINGS_CLEAR} from '../actions/log';
import {DEFAULT_LOG, Log} from '../models/log';
import {logReducer} from './log';

describe('reducers/log', () => {
  const simpleLog: Log = {
    warnings: {
      warn: ['warning 1', 'warning 2'],
      info: [],
      debug: []
    },
    errors: ['error 1', 'error 2']
  };

  describe(LOG_ERRORS_ADD, () => {
    it('should add an error to the existing log', () => {
      const errors = ['this is an error'];
      expect(logReducer(DEFAULT_LOG, {
        type: LOG_ERRORS_ADD,
        payload: {
          errors
        }
      })).toEqual({
        ...DEFAULT_LOG,
        errors
      });
    });

    it('should not add duplicate errors', () => {
      const errors = ['error 1', 'error 1'];
      expect(logReducer(simpleLog, {
        type: LOG_ERRORS_ADD,
        payload: {
          errors
        }
      })).toEqual({
        ...simpleLog,
        errors: ['error 1', 'error 2']
      });
    });
  });

  describe(LOG_WARNINGS_ADD, () => {
    it('should add warnings to the existing log', () => {
      const warnings = ['this is the first warning', 'this is the second warning'];
      expect(logReducer(DEFAULT_LOG, {
        type: LOG_WARNINGS_ADD,
        payload: {
          warnings,
          level: 'warn'
        }
      })).toEqual({
        ...DEFAULT_LOG,
        warnings: {
          warn: warnings,
          info: [],
          debug: []
        }
      });
    });

    it('should not add duplicate warnings', () => {
      const warnings = ['warning 1', 'warning 3'];
      expect(logReducer(simpleLog, {
        type: LOG_WARNINGS_ADD,
        payload: {
          warnings,
          level: 'warn'
        }
      })).toEqual({
        ...simpleLog,
        warnings: {
          warn: ['warning 1', 'warning 2', 'warning 3'],
          info: [],
          debug: []
        }
      });
    });
  });

  describe(LOG_WARNINGS_CLEAR, () => {
    it('should remove all warnings in the existing log', () => {
      expect(logReducer(simpleLog, {
        type: LOG_WARNINGS_CLEAR
      })).toEqual({
        ...simpleLog,
        warnings: {
          warn: [],
          info: [],
          debug: []
        }
      });
    });
  });

  describe(LOG_ERRORS_CLEAR, () => {
    it('should remove error in the existing log', () => {
      expect(logReducer(simpleLog, {
        type: LOG_ERRORS_CLEAR
      })).toEqual({
        ...simpleLog,
        errors: []
      });
    });
  });
});
