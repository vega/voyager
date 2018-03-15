import { Store } from 'redux';
import { GenericState, UndoableStateBase } from '../models/index';
export declare let actionLogs: any;
export declare function configureStore(initialState?: GenericState<UndoableStateBase>): Store<GenericState<UndoableStateBase>>;
