import {Query} from 'compassql/build/src/query/query';
import {Store} from 'redux';
import {StateWithHistory} from 'redux-undo';
import {resultRequest} from '../actions/result';
import {StateBase} from '../models/index';

export function dispatchQueries(store: Store<StateWithHistory<Readonly<StateBase>>>, query: Query) {
  // TODO: consider state of the query and make queries for related views too.
  store.dispatch(resultRequest('main', query));
}
