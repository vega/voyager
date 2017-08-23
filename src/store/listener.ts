import {Query} from 'compassql/build/src/query/query';
import {Store} from 'redux';
import {Data} from 'vega-lite/build/src/data';
import {State} from '../models/index';
import {ShelfFilter} from '../models/shelf/filter';
import {dispatchQueries} from '../queries/index';
import {selectData, selectQuery} from '../selectors/index';
import {selectFilters} from '../selectors/shelf';

export function createQueryListener(store: Store<State>) {
  let query: Query;

  // TODO: remove data and filter once we use dataflow api to filter data locally
  let data: Data;
  let filters: ShelfFilter[];

  return () => {
    const state = store.getState();
    const previousQuery = query;
    query = selectQuery(state);

    const previousData = data;
    data = selectData(state);

    const previousFilters = filters;
    filters = selectFilters(state);

    if (!data) {
      return;
    }

    // Check if either query or data has changed, need to submit a new query.
    if (previousQuery !== query || previousData !== data || previousFilters !== filters) {
      dispatchQueries(store, query);
    }
  };
}
