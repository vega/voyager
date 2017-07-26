import { Store } from 'redux';
import { StateWithHistory } from 'redux-undo';
import { StateBase } from '../models/index';
export declare function createQueryListener(store: Store<StateWithHistory<Readonly<StateBase>>>): () => void;
