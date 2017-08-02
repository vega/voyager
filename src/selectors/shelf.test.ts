import {DEFAULT_STATE, DEFAULT_STATE_WITH_HISTORY} from '../models/index';
import {toQuery} from '../models/shelf/index';
import {hasWildcards} from '../models/shelf/spec';
import {selectFilters, selectIsQuerySpecific, selectQuery, selectQuerySpec, selectShelf} from './shelf';


describe('selectors/shelf', () => {
  describe('selectFilters', () => {
    it('selecting filters should returns an array of filters', () => {
      const filters = [{field: 'q1', range: [0, 1]}];
      const state = {
        ...DEFAULT_STATE_WITH_HISTORY,
        present: {
          ...DEFAULT_STATE,
          shelf: {
            ...DEFAULT_STATE.shelf,
            spec: {
              ...DEFAULT_STATE.shelf.spec,
              filters
            }
          }
        }
      };
      expect(selectFilters(state)).toBe(filters);
    });
  });

  describe('selectShelf', () => {
    it('selecting shelf should return the default shelf', () => {
      expect(selectShelf(DEFAULT_STATE_WITH_HISTORY)).toBe(DEFAULT_STATE.shelf);
    });
  });

  describe('selectQuery', () => {
    it('selecting query should return the query constructed with default shelf', () => {
      expect(selectQuery(DEFAULT_STATE_WITH_HISTORY)).toEqual(toQuery(DEFAULT_STATE.shelf));
    });
  });

  describe('selectQuerySpec', () => {
    it('selecting query spec should return the default query spec', () => {
      expect(selectQuerySpec(DEFAULT_STATE_WITH_HISTORY)).toEqual(toQuery(DEFAULT_STATE.shelf).spec);
    });
  });

  describe('selectIsQuerySpecific', () => {
    it('selecting isQuerySpecific should return whether the default query is specific', () => {
      expect(selectIsQuerySpecific(DEFAULT_STATE_WITH_HISTORY)).toEqual(
        !hasWildcards(toQuery(DEFAULT_STATE.shelf).spec).hasAnyWildcard
      );
    });
  });
});

