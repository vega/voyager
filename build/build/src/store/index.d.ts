import { StateWithHistory } from 'redux-undo';
import { StateBase } from '../models';
import { Store } from 'redux';
export declare function configureStore(initialState?: StateBase): Store<StateWithHistory<Readonly<StateBase>>>;
