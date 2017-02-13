/**
 * Helpers for implementing actions with Typescript.
 */

import {Action as BaseReduxAction} from 'redux';
import {Dispatch} from 'redux';

/**
 * Basic Redux Action of type A.
 * (A should be a type of a string literal.)
 */
export interface PlainReduxAction<A> extends BaseReduxAction {
  type: A;
};

/**
 *
 */
export interface ReduxAction<A, P> extends PlainReduxAction<A> {
  payload: P;
};

/**
 * Handler mixins interface for dealing with actions from presentation components.
 */
export interface ActionHandler<A> {
  handleAction: (action: A) => void;
}

/**
 * Create a handleAction object
 */
export function createDispatchHandler<A extends BaseReduxAction>() {
  return (dispatch: Dispatch<A>): ActionHandler<A> => ({
    handleAction(action: A) {
      dispatch(action);
    }
  });
}
