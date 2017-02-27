import {Schema} from 'compassql/build/src/schema';

import {ExtendedUnitSpec} from 'vega-lite/src/spec';

import {Query, query as recommend} from 'compassql/build/src/query/query';
import {createSelector} from 'reselect';
import {Data} from 'vega-lite/src/data';
import {State} from './models';
import {Shelf, toQuery} from './models/shelf';

const getData = (state: State) => state.present.dataset.data;
const getShelf = (state: State) => state.present.shelf;
const getSchema = (state: State) => state.present.dataset.schema;

export const getQuery = createSelector(
  getShelf,
  (shelf: Shelf) => {
    return toQuery(shelf);
  }
);

export const getMainSpec = createSelector(
  getQuery, getSchema, getData,
  (query: Query, schema: Schema, data: Data): ExtendedUnitSpec => {
    const rec = recommend(query, schema);
    return {
      data,
      ...rec.result.getTopSpecQueryModel().toSpec()
    };
  }
);
