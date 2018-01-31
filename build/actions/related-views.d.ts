import { PlainReduxAction } from './redux-action';
export declare type RelatedViewsAction = HideRelatedViews;
export declare const RELATED_VIEWS_HIDE_TOGGLE = "RELATED_VIEWS_HIDE_TOGGLE";
export declare type HideRelatedViews = PlainReduxAction<typeof RELATED_VIEWS_HIDE_TOGGLE>;
