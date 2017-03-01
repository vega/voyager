import {Schema} from 'compassql/build/src/schema';

import {FacetedUnitSpec} from 'vega-lite/build/src/spec';

import {Query} from 'compassql/build/src/query/query';
import {recommend} from 'compassql/build/src/recommend';
import {createSelector} from 'reselect';
import {Data} from 'vega-lite/build/src/data';
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
  (query: Query, schema: Schema, data: Data): FacetedUnitSpec => {
    const rec = recommend(query, schema);
    return {
      data,
      ...rec.result.getTopSpecQueryModel().toSpec()
    };
  }
);
