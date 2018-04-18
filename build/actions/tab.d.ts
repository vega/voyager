import { Action } from './index';
import { PlainReduxAction, ReduxAction } from './redux-action';
export declare type TabAction = (TabAdd | TabRemove | TabSwitch | TabTitleUpdate);
export declare type TabActionType = TabAction['type'];
export declare const TAB_ACTION_TYPE_INDEX: {
    [k in TabActionType]: 1;
};
export declare function isTabAction(action: Action): action is TabAction;
export declare const TAB_ADD = "TAB_ADD";
export declare type TabAdd = PlainReduxAction<typeof TAB_ADD>;
export declare const TAB_REMOVE = "TAB_REMOVE";
export declare type TabRemove = PlainReduxAction<typeof TAB_REMOVE>;
export declare const TAB_SWITCH = "TAB_SWITCH";
export declare type TabSwitch = ReduxAction<typeof TAB_SWITCH, {
    tabID: number;
}>;
export declare const TAB_TITLE_UPDATE = "TAB_TITLE_UPDATE";
export declare type TabTitleUpdate = ReduxAction<typeof TAB_TITLE_UPDATE, {
    title: string;
}>;
