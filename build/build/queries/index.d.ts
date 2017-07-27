import { Query } from 'compassql/build/src/query/query';
import { Store } from 'redux';
import { StateWithHistory } from 'redux-undo';
import { StateBase } from '../models/index';
export declare function dispatchQueries(store: Store<StateWithHistory<Readonly<StateBase>>>, query: Query): void;
