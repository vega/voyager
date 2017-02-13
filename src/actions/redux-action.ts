
export interface PlainReduxAction<T> {
  type: T;
};

/**
 *
 */
export interface ReduxAction<T, P> {
  type: T;
  payload: P;
};
