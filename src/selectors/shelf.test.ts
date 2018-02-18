import {Schema} from 'compassql/build/src/schema';
import {DEFAULT_CUSTOM_WILDCARD_FIELDS} from '../models/custom-wildcard-field';
import {DEFAULT_ACTIVE_TAB_ID, DEFAULT_PERSISTENT_STATE, DEFAULT_PLOT_TAB_STATE,
  DEFAULT_STATE, DEFAULT_UNDOABLE_STATE_BASE, State} from '../models/index';
import {DEFAULT_SHELF, toQuery} from '../models/shelf/index';
import {hasWildcards} from '../models/shelf/spec';
import {toSpecQuery} from '../models/shelf/spec/index';
import {selectFilters, selectIsQuerySpecific, selectQuery, selectQuerySpec, selectShelfGroupBy} from './shelf';
import {selectActiveTab} from './tab';

describe('selectors/shelf', () => {
  describe('selectFilters', () => {
    it('selecting filters should returns an array of filters', () => {
      const filters = [{field: 'q1', range: [0, 1]}];

      const state: State = {
        persistent: DEFAULT_PERSISTENT_STATE,
        undoable: {
          ...DEFAULT_STATE.undoable,
          present: {
            ...DEFAULT_UNDOABLE_STATE_BASE,
            dataset: {
              data: {
                values: []
              },
              isLoading: false,
              name: 'Test',
              schema: new Schema({
                fields: []
              }),
            },
            customWildcardFields: DEFAULT_CUSTOM_WILDCARD_FIELDS,
            tab: {
              activeTabID: DEFAULT_ACTIVE_TAB_ID,
              list: [{
                ...DEFAULT_PLOT_TAB_STATE,
                shelf: {
                  ...DEFAULT_SHELF,
                  filters
                }
              }]
            }
          }
        }
      };

      expect(selectFilters(state)).toBe(filters);
    });
  });

  const defaultShelf = selectActiveTab(DEFAULT_STATE).shelf;

  describe('selectShelfGroupBy', () => {
    it('selecting shelf should return the default shelf', () => {
      expect(selectShelfGroupBy(DEFAULT_STATE)).toBe(defaultShelf.groupBy);
    });
  });

  describe('selectQuery', () => {
    it('selecting query should return the query constructed with default shelf', () => {
      expect(selectQuery(DEFAULT_STATE)).toEqual(toQuery(defaultShelf));
    });
  });

  describe('selectQuerySpec', () => {
    it('selecting query spec should return the default query spec', () => {
      expect(selectQuerySpec(DEFAULT_STATE)).toEqual(toQuery(defaultShelf).spec);
    });
  });

  describe('selectIsQuerySpecific', () => {
    it('selecting isQuerySpecific should return whether the default query is specific', () => {
      const specQ = toSpecQuery(defaultShelf.spec);
      expect(selectIsQuerySpecific(DEFAULT_STATE)).toEqual(
        !hasWildcards(specQ).hasAnyWildcard
      );
    });
  });
});

