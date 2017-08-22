export interface Log {
  error: string;
  warnings: string[];
};

export const DEFAULT_LOG: Log = {
  error: null,
  warnings: []
};
