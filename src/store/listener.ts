import {Query} from 'compassql/build/src/query/query';
import {Store} from 'redux';
import {StateWithHistory} from 'redux-undo';
import {Data} from 'vega-lite/build/src/data';
import {resultRequest} from '../actions/result';
import {StateBase} from '../models/index';
import {selectData, selectQuery} from '../selectors/index';

export function createQueryListener(store: Store<StateWithHistory<Readonly<StateBase>>>) {
  let data: Data;
  let query: Query;
  return () => {
    const state = store.getState();
    const previousQuery = query;
    query = selectQuery(state);

    const previousData = data;
    data = selectData(state);

    // Check if either query or data has changed, need to submit a new query.
    if (previousQuery !== query || previousData !== data) {
      // TODO: consider state of the query and make queries for related views too.
      store.dispatch(resultRequest('main', query));
    }
  };
}
