import {PlotTabState, State, Tabs} from '../models';

export const selectTabs = (state: State): Tabs => state.undoable.present.tabs;
export const selectActiveTabID = (state: State): number => state.undoable.present.tabs.activeTabID;
export const selectActiveTab = (state: State): PlotTabState => selectTabs(state).list[selectActiveTabID(state)];
