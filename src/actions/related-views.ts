import {PlainReduxAction} from './redux-action';

export type RelatedViewAction = HideRelatedViews;

export const RELATED_VIEWS_HIDE_TOGGLE = 'RELATED_VIEW_HIDE_TOGGLE';
export type HideRelatedViews = PlainReduxAction<typeof RELATED_VIEWS_HIDE_TOGGLE>;
