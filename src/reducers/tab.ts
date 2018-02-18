import {combineReducers} from 'redux';
import {Action,
  TAB_ADD,
  TAB_REMOVE,
  TAB_SWITCH,
  TAB_TITLE_UPDATE
} from '../actions';
import {DEFAULT_PLOT_TAB_STATE, DEFAULT_TAB, DEFAULT_TAB_TITLE, PlotTabState, Tab} from '../models';
import {resultIndexReducer} from './result';
import {shelfReducer} from './shelf';
import {modifyItemInArray, removeItemFromArray} from './util';

const combinedPlotTabReducer = combineReducers<PlotTabState>({
  title: titleReducer,
  shelf: shelfReducer,
  result: resultIndexReducer
});

export function titleReducer(title: Readonly<string> = DEFAULT_TAB_TITLE, action: Action): string {
  switch (action.type) {
    case TAB_TITLE_UPDATE:
      return action.payload.title;
  }

  return title;
}

export function tabReducer(tab: Readonly<Tab> = DEFAULT_TAB, action: Action): Tab {
  const {activeTabID, list} = tab;

  switch (action.type) {
    case TAB_ADD:
      return {
        ...tab,
        activeTabID: list.length, // activate the new tab
        list: [...list, DEFAULT_PLOT_TAB_STATE]
      };

    case TAB_REMOVE:
      if (list.length === 1) { // if only one tab, don't remove
        return tab;
      }
      const newActiveTabID = activeTabID < list.length - 1 ?
        activeTabID : // activate next tab by default.
        activeTabID - 1; // except for last tab in the list, activate previous tab.
      return {
        ...tab,
        activeTabID: newActiveTabID,
        list: removeItemFromArray(list, activeTabID).array
      };

    case TAB_SWITCH:
      if (activeTabID === action.payload.tabID) {
        return tab;
      }
      return {
        ...tab,
        activeTabID: action.payload.tabID
      };
  }

  return {
    ...tab,
    list: modifyItemInArray(tab.list, tab.activeTabID,
      (plotTabState: PlotTabState) => combinedPlotTabReducer(plotTabState, action))
  };
}
