import {PlotTabState, State, Tab} from '../models';

export const selectTab = (state: State): Tab => state.undoable.present.tab;
export const selectActiveTabID = (state: State): number => state.undoable.present.tab.activeTabID;
export const selectActiveTab = (state: State): PlotTabState => selectTab(state).list[selectActiveTabID(state)];
