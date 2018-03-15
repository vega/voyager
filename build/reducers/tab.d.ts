import { Action } from '../actions';
import { Tab } from '../models';
export declare function titleReducer(title: Readonly<string>, action: Action): string;
export declare function tabReducer(tab: Readonly<Tab>, action: Action): Tab;
