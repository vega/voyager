import { createSelector } from 'reselect'
import {State} from './models';
import {Shelf, toQuery} from './models/shelf';

const getShelf = (state: State) => state.present.shelf;

export const getQuery = createSelector(
  getShelf,
  (shelf: Shelf) => {
    return toQuery(shelf);
  }
);
