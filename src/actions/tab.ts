import {Action} from './index';
import {PlainReduxAction, ReduxAction} from './redux-action';
import {RESULT_ACTION_TYPE_INDEX, ResultAction} from './result';
import {ShelfAction, SPEC_ACTION_TYPE_INDEX} from './shelf';

/* Actions concerning a single tab */
export type SingleTabAction = (
  ResultAction |
  ShelfAction |
  TitleUpdate
);

export type SingleTabActionType = SingleTabAction['type'];

export const SINGLE_TAB_ACTION_TYPE_INDEX: {[k in SingleTabActionType]: 1} = {
  ...RESULT_ACTION_TYPE_INDEX,

  FILTER_ADD: 1,
  FILTER_CLEAR: 1,
  FILTER_MODIFY_EXTENT: 1,
  FILTER_MODIFY_MAX_BOUND: 1,
  FILTER_MODIFY_MIN_BOUND: 1,
  FILTER_MODIFY_TIME_UNIT: 1,
  FILTER_MODIFY_ONE_OF: 1,
  FILTER_REMOVE: 1,
  FILTER_TOGGLE: 1,

  SHELF_AUTO_ADD_COUNT_CHANGE: 1,
  SHELF_GROUP_BY_CHANGE: 1,
  SHELF_LOAD_QUERY: 1,

  ...SPEC_ACTION_TYPE_INDEX,

  TITLE_UPDATE: 1
};

export function isSingleTabAction(action: Action): action is SingleTabAction {
  return SINGLE_TAB_ACTION_TYPE_INDEX[action.type];
}

export const TITLE_UPDATE = 'TITLE_UPDATE';
export type TitleUpdate = ReduxAction<typeof TITLE_UPDATE, {
  newTitle: string;
}>;

/* Actions concerning multiple tabs */
export type MultiTabAction = (
  TabAdd |
  TabRemove |
  TabSwitch
);

export type MultiTabActionType = MultiTabAction['type'];

export const MULTI_TAB_ACTION_TYPE_INDEX: {[k in MultiTabActionType]: 1} = {
  TAB_ADD: 1,
  TAB_REMOVE: 1,
  TAB_SWITCH: 1
};

export function isMultiTabAction(action: Action): action is MultiTabAction {
  return MULTI_TAB_ACTION_TYPE_INDEX[action.type];
}

export const TAB_ADD = 'TAB_ADD';
export type TabAdd = PlainReduxAction<typeof TAB_ADD>;

export const TAB_REMOVE = 'TAB_REMOVE';
export type TabRemove = PlainReduxAction<typeof TAB_REMOVE>;

export const TAB_SWITCH = 'TAB_SWITCH';
export type TabSwitch = ReduxAction<typeof TAB_SWITCH, {
  tabID: number;
}>;

/* Union of tab actions */
export type TabAction = SingleTabAction | MultiTabAction;

export type TabActionType = TabAction['type'];

export const TAB_ACTION_TYPE_INDEX: {[k in TabActionType]: 1} = {
  ...SINGLE_TAB_ACTION_TYPE_INDEX,
  ...MULTI_TAB_ACTION_TYPE_INDEX
};
