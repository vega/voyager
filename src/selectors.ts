import { createSelector } from 'reselect'
import {State} from './models';
import {Shelf, toQuery} from './models/shelf';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {query as recommend, Query} from 'compassql/build/src/query/query'; // TODO: change this to recommend
import {isWildcard} from 'compassql/build/src/wildcard';
import {SpecQueryModel} from 'compassql/build/src/model';
import {Schema} from 'compassql/build/src/schema';
import {ExtendedUnitSpec} from 'vega-lite/src/spec';

const getShelf = (state: State) => state.present.shelf;
const getSchema = (state: State) => state.present.data.schema;

export const getQuery = createSelector(
  getShelf,
  (shelf: Shelf) => {
    return toQuery(shelf);
  }
);

export const getMainSpec = createSelector(
  getQuery, getSchema,
  (query: Query, schema: Schema): ExtendedUnitSpec => {
    const rec = recommend(query, schema);
    return rec.result.getTopSpecQueryModel().toSpec();
  }
);
