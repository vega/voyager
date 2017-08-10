import {Schema} from 'compassql/build/src/schema';
import {DEFAULT_BOOKMARK} from '../models/bookmark';
import {DEFAULT_VOYAGER_CONFIG} from '../models/config';
import {DEFAULT_STATE, State} from '../models/index';
import {DEFAULT_LOG} from '../models/log';
import {DEFAULT_RESULT_INDEX} from '../models/result';
import {DEFAULT_SHELF_PREVIEW} from '../models/shelf-preview';
import {toQuery} from '../models/shelf/index';
import {DEFAULT_SHELF_UNIT_SPEC, hasWildcards} from '../models/shelf/spec';
import {selectFilters, selectIsQuerySpecific, selectQuery, selectQuerySpec, selectShelf} from './shelf';

describe('selectors/shelf', () => {
  describe('selectFilters', () => {
    it('selecting filters should returns an array of filters', () => {
      const filters = [{field: 'q1', range: [0, 1]}];

      const state: State = {
        persistent: {
          bookmark: {
            ...DEFAULT_BOOKMARK
          },
          config: {
            ...DEFAULT_VOYAGER_CONFIG
          },
          shelfPreview: {
            ...DEFAULT_SHELF_PREVIEW
          }
        },
        undoable: {
          ...DEFAULT_STATE.undoable,
          present: {
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
            log: DEFAULT_LOG,
            shelf: {
              spec: {
                ...DEFAULT_SHELF_UNIT_SPEC
              }
            },
            result: {
              ...DEFAULT_RESULT_INDEX
            }
          }
        }
      };

      state.undoable.present.shelf.spec.filters = filters;

      expect(selectFilters(state)).toBe(filters);
    });
  });

  describe('selectShelf', () => {
    it('selecting shelf should return the default shelf', () => {
      expect(selectShelf(DEFAULT_STATE)).toBe(DEFAULT_STATE.undoable.present.shelf);
    });
  });

  describe('selectQuery', () => {
    it('selecting query should return the query constructed with default shelf', () => {
      expect(selectQuery(DEFAULT_STATE)).toEqual(toQuery(DEFAULT_STATE.undoable.present.shelf));
    });
  });

  describe('selectQuerySpec', () => {
    it('selecting query spec should return the default query spec', () => {
      expect(selectQuerySpec(DEFAULT_STATE)).toEqual(toQuery(DEFAULT_STATE.undoable.present.shelf).spec);
    });
  });

  describe('selectIsQuerySpecific', () => {
    it('selecting isQuerySpecific should return whether the default query is specific', () => {
      expect(selectIsQuerySpecific(DEFAULT_STATE)).toEqual(
        !hasWildcards(toQuery(DEFAULT_STATE.undoable.present.shelf).spec).hasAnyWildcard
      );
    });
  });
});

