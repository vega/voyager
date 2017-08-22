export type WarningLevel = 'warn' | 'debug' | 'info';

export interface Log {
  errors: string[];
  warnings: {
    warn: string[],
    info: string[],
    debug: string[]
  };
};

export const DEFAULT_LOG: Log = {
  errors: [],
  warnings: {
    warn: [],
    info: [],
    debug: []
  }
};
