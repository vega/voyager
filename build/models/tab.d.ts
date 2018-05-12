import { ResultIndex } from './result';
import { Shelf } from './shelf';
export declare const DEFAULT_TAB_TITLE = "untitled";
export interface PlotTabState {
    title: string;
    shelf: Shelf;
    result: ResultIndex;
}
export declare const DEFAULT_PLOT_TAB_STATE: {
    title: string;
    shelf: Readonly<Shelf>;
    result: ResultIndex;
};
export interface Tab {
    activeTabID: number;
    list: PlotTabState[];
}
export declare const DEFAULT_ACTIVE_TAB_ID = 0;
export declare const DEFAULT_TAB: {
    activeTabID: number;
    list: {
        title: string;
        shelf: Readonly<Shelf>;
        result: ResultIndex;
    }[];
};
