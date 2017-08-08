// tslint:disable:no-unused-variable
import {StateWithHistory} from 'redux-undo';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {State} from '../models/index';
// tslint:enable:no-unused-variable

import {Query} from 'compassql/build/src/query/query';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {createSelector} from 'reselect';
import {Shelf, toQuery} from '../models/shelf/index';
import {hasWildcards} from '../models/shelf/spec';

export const selectFilters = (state: State) => state.undoable.present.shelf.spec.filters;

export const selectShelf = (state: State): Shelf => state.undoable.present.shelf;

export const selectQuery = createSelector(
  selectShelf,
  (shelf: Shelf): Query => {
    return toQuery(shelf);
  }
);

export const selectQuerySpec = createSelector(
  selectQuery,
  (query: Query): SpecQuery => query.spec
);

export const selectIsQuerySpecific = createSelector(
  selectQuerySpec,
  (spec: SpecQuery) => {
    return !hasWildcards(spec).hasAnyWildcard;
  }
);
