import {combineReducers} from 'redux';
import {Action,
  isMultiTabAction,
  isSingleTabAction,
  TAB_ADD,
  TAB_REMOVE,
  TAB_SWITCH,
  TITLE_UPDATE
} from '../actions';
import {DEFAULT_SINGLE_VIEW_TAB_STATE, DEFAULT_TAB_TITLE, DEFAULT_TABS, SingleViewTabState, Tabs} from '../models';
import {resultIndexReducer} from './result';
import {shelfReducer} from './shelf';
import {modifyItemInArray, removeItemFromArray} from './util';

const combinedSingleViewTabReducer = combineReducers<SingleViewTabState>({
  title: titleReducer,
  shelf: shelfReducer,
  result: resultIndexReducer
});

export function titleReducer(title: Readonly<string> = DEFAULT_TAB_TITLE, action: Action): string {
  switch (action.type) {
    case TITLE_UPDATE:
      return action.payload.newTitle;
  }

  return title;
}

export function multiTabsReducer(tabs: Readonly<Tabs> = DEFAULT_TABS, action: Action): Tabs {
  const {activeTabID, list} = tabs;

  switch (action.type) {
    case TAB_ADD:
      return {
        ...tabs,
        activeTabID: list.length, // activate the new tab
        list: [...list, DEFAULT_SINGLE_VIEW_TAB_STATE]
      };

    case TAB_REMOVE:
      if (list.length === 1) { // if only one tab, don't remove
        return tabs;
      }
      const newActiveTabID = activeTabID < list.length - 1 ?
        activeTabID : // activate next tab by default.
        activeTabID - 1; // except for last tab in the list, activate previous tab.
      return {
        ...tabs,
        activeTabID: newActiveTabID,
        list: removeItemFromArray(list, activeTabID).array
      };

    case TAB_SWITCH:
      if (activeTabID === action.payload.tabID) {
        return tabs;
      }
      return {
        ...tabs,
        activeTabID: action.payload.tabID
      };

    default:
      return tabs;
  }

}

export function tabsReducer(tabs: Readonly<Tabs> = DEFAULT_TABS, action: Action): Tabs {
  if (isMultiTabAction(action)) {
    return multiTabsReducer(tabs, action);
  }

  if (isSingleTabAction(action)) {
    return {
      ...tabs,
      list: modifyItemInArray(tabs.list, tabs.activeTabID,
        (singleViewTabState: SingleViewTabState) => combinedSingleViewTabReducer(singleViewTabState, action))
    };
  }

  return tabs;
}
