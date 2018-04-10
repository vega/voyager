import { PlotTabState, Tab } from '../models';
import { GenericState, UndoableStateBase } from '../models';
export declare const selectTab: (state: GenericState<UndoableStateBase>) => Tab;
export declare const selectActiveTabID: (state: GenericState<UndoableStateBase>, props?: any) => number;
export declare const selectActiveTab: (state: GenericState<UndoableStateBase>, props?: any) => PlotTabState;
