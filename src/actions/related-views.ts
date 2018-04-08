import {ReduxAction} from './redux-action';

export type RelatedViewsAction = HideRelatedViews;

export const RELATED_VIEWS_HIDE_TOGGLE = 'RELATED_VIEWS_HIDE_TOGGLE';
export type HideRelatedViews = ReduxAction<typeof RELATED_VIEWS_HIDE_TOGGLE, {
  hideRelatedViews: boolean
}>;
