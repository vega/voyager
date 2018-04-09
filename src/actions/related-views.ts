import {ReduxAction} from './redux-action';

export type RelatedViewsAction = RelatedViewsHideToggle;

export const RELATED_VIEWS_HIDE_TOGGLE = 'RELATED_VIEWS_HIDE_TOGGLE';
export type RelatedViewsHideToggle = ReduxAction<typeof RELATED_VIEWS_HIDE_TOGGLE, {
  newIsCollapsed: boolean
}>;
