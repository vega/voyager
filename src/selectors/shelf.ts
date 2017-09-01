// tslint:disable:no-unused-variable
import {StateWithHistory} from 'redux-undo';
import {OneOfFilter, RangeFilter} from 'vega-lite/build/src/filter';
import {State} from '../models/index';
// tslint:enable:no-unused-variable

import {Query} from 'compassql/build/src/query/query';
import {SpecQuery} from 'compassql/build/src/query/spec';
import {createSelector} from 'reselect';
import {ShelfFilter} from '../models/shelf/filter';
import {getDefaultGroupBy, Shelf, ShelfGroupBy, toQuery} from '../models/shelf/index';
import {hasWildcards, ShelfUnitSpec} from '../models/shelf/spec';

export const selectShelf = (state: State): Shelf => state.undoable.present.shelf;

export const selectShelfGroupBy = createSelector(selectShelf,
  (shelf: Shelf): ShelfGroupBy => shelf.groupBy
);

export const selectShelfSpec = createSelector(selectShelf,
  (shelf: Shelf): ShelfUnitSpec => shelf.spec
);

export const selectFilters = createSelector(selectShelf,
  (shelf: Shelf): ShelfFilter[] => shelf.filters
);

export const selectShelfAutoAddCount = createSelector(selectShelf,
  (shelf: Shelf) => shelf.autoAddCount
);

export const selectQuery = createSelector(
  selectShelfSpec,
  selectShelfGroupBy,
  selectShelfAutoAddCount,
  (spec: ShelfUnitSpec, groupBy: ShelfGroupBy, autoAddCount: boolean): Query => {
    return toQuery({spec, groupBy, autoAddCount});
  }
);

export const selectQuerySpec = createSelector(
  selectQuery,
  (query: Query): SpecQuery => query.spec
);

export const selectDefaultGroupBy = createSelector(
  selectQuerySpec,
  (specQ: SpecQuery) => {
    return getDefaultGroupBy(hasWildcards(specQ));
  }
);

export const selectIsQuerySpecific = createSelector(
  selectQuerySpec,
  (spec: SpecQuery) => {
    return !hasWildcards(spec).hasAnyWildcard;
  }
);

export const selectIsQueryEmpty = createSelector(
  selectQuerySpec,
  (spec: SpecQuery) => {
    return spec.encodings.length === 0;
  }
);
