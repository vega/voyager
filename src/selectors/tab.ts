import {createSelector} from 'reselect';
import {PlotTabState, State, Tab} from '../models';

export const selectTab = (state: State): Tab => state.undoable.present.tab;

export const selectActiveTabID = createSelector(
  selectTab,
  (tab: Tab): number => tab.activeTabID
);

export const selectActiveTab = createSelector(
  selectTab,
  selectActiveTabID,
  (tab: Tab, activeTabID: number): PlotTabState => tab.list[activeTabID]
);
