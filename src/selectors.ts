import { createSelector } from 'reselect'
import {State} from './models';
import {UnitShelf, toSpecQuery} from './models/shelf';

const getShelf = (state: State) => state.present.shelf;

export const getSpecQuery = createSelector(
  getShelf,
  (shelf: UnitShelf) => {
    return toSpecQuery(shelf);
  }
);
