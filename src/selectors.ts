import {Schema} from 'compassql/build/src/schema';

import {SpecQueryModelGroup} from 'compassql/build/src/model';
import {Query} from 'compassql/build/src/query/query';
import {recommend} from 'compassql/build/src/recommend';
import {createSelector} from 'reselect';
import {State} from './models';
import {Shelf, toQuery} from './models/shelf';

export const getData = (state: State) => state.present.dataset.data;
const getShelf = (state: State) => state.present.shelf;
const getSchema = (state: State) => state.present.dataset.schema;

export const getQuery = createSelector(
  getShelf,
  (shelf: Shelf) => {
    return toQuery(shelf);
  }
);

export const getMainResult = createSelector(
  getQuery, getSchema, getData,
  (query: Query, schema: Schema): SpecQueryModelGroup => {
    return recommend(query, schema).result;
  }
);
