import {DEFAULT_RESULT_INDEX, ResultIndex} from './result';
import {DEFAULT_SHELF, Shelf} from './shelf';

export const DEFAULT_TAB_TITLE = 'untitled';

export interface PlotTabState {
  title: string;
  shelf: Shelf;
  result: ResultIndex;
}

export const DEFAULT_PLOT_TAB_STATE = {
  title: DEFAULT_TAB_TITLE,
  shelf: DEFAULT_SHELF,
  result: DEFAULT_RESULT_INDEX
};

export interface Tab {
  activeTabID: number;
  list: PlotTabState[];
}

export const DEFAULT_ACTIVE_TAB_ID = 0;

export const DEFAULT_TAB = {
  activeTabID: DEFAULT_ACTIVE_TAB_ID,
  list: [DEFAULT_PLOT_TAB_STATE]
};
