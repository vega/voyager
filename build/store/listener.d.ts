import { Store } from 'redux';
import { State } from '../models/index';
export declare function createQueryListener(store: Store<State>): () => void;
