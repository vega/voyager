import { ReduxAction } from './redux-action';
export declare type RelatedViewsAction = RelatedViewsHideToggle;
export declare const RELATED_VIEWS_HIDE_TOGGLE = "RELATED_VIEWS_HIDE_TOGGLE";
export declare type RelatedViewsHideToggle = ReduxAction<typeof RELATED_VIEWS_HIDE_TOGGLE, {
    newIsCollapsed: boolean;
}>;
