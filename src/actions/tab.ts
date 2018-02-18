import {Action} from './index';
import {PlainReduxAction, ReduxAction} from './redux-action';

export type TabAction = (
  TabAdd |
  TabRemove |
  TabSwitch |
  TabTitleUpdate
);

export type TabActionType = TabAction['type'];

export const TAB_ACTION_TYPE_INDEX: {[k in TabActionType]: 1} = {
  TAB_ADD: 1,
  TAB_REMOVE: 1,
  TAB_SWITCH: 1,
  TAB_TITLE_UPDATE: 1
};

export function isTabAction(action: Action): action is TabAction {
  return TAB_ACTION_TYPE_INDEX[action.type];
}

export const TAB_ADD = 'TAB_ADD';
export type TabAdd = PlainReduxAction<typeof TAB_ADD>;

export const TAB_REMOVE = 'TAB_REMOVE';
export type TabRemove = PlainReduxAction<typeof TAB_REMOVE>;

export const TAB_SWITCH = 'TAB_SWITCH';
export type TabSwitch = ReduxAction<typeof TAB_SWITCH, {
  tabID: number;
}>;

export const TAB_TITLE_UPDATE = 'TAB_TITLE_UPDATE';
export type TabTitleUpdate = ReduxAction<typeof TAB_TITLE_UPDATE, {
  title: string;
}>;
