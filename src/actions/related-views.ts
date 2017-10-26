import {PlainReduxAction} from './redux-action';

export type RelatedViewAction = HideRelatedView;

export const RELATED_VIEW_HIDE_TOGGLE = 'RELATED_VIEW_HIDE_TOGGLE';
export type HideRelatedView = PlainReduxAction<typeof RELATED_VIEW_HIDE_TOGGLE>;
