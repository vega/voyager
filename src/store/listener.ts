import {Query} from 'compassql/build/src/query/query';
import {Store} from 'redux';
import {StateWithHistory} from 'redux-undo';
import {resultRequest} from '../actions/result';
import {StateBase} from '../models/index';
import {selectQuery} from '../selectors/index';

export function createQueryListener(store: Store<StateWithHistory<Readonly<StateBase>>>) {
  let query: Query;
  return () => {
    const previousQuery = query;
    query = selectQuery(store.getState());

    if (previousQuery !== query) {
      // TODO: consider state of the query and make queries for related views too.
      store.dispatch(resultRequest('main', query));
    }
  };
}
