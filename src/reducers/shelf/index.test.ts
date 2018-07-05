import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {SHELF_LOAD_QUERY} from '../../actions';
import {SHELF_AUTO_ADD_COUNT_CHANGE, SHELF_GROUP_BY_CHANGE} from '../../actions/shelf/index';
import {SPEC_LOAD, SpecLoad} from '../../actions/shelf/spec';
import {DEFAULT_SHELF, Shelf} from '../../models/shelf/index';
import {DEFAULT_SHELF_UNIT_SPEC} from '../../models/shelf/spec/index';
import {addCategoricalField} from '../../queries/field-suggestions';
import {summaries} from '../../queries/summaries';
import {shelfReducer} from './index';

describe('reducers/shelf', () => {
  describe(SHELF_AUTO_ADD_COUNT_CHANGE, () => {
    it('changes autoAddCount', () => {
      expect(
        shelfReducer({
          ...DEFAULT_SHELF
        }, {
          type: SHELF_AUTO_ADD_COUNT_CHANGE,
          payload: {autoAddCount: false}
        }),
      ).toEqual({
        ...DEFAULT_SHELF,
        autoAddCount: false
      });
    });
  });

  describe(SHELF_GROUP_BY_CHANGE, () => {
    it('changes autoAddCount', () => {
      expect(
        shelfReducer({
          ...DEFAULT_SHELF
        }, {
          type: SHELF_GROUP_BY_CHANGE,
          payload: {groupBy: 'encoding'}
        }),
      ).toEqual({
        ...DEFAULT_SHELF,
        groupBy: 'encoding'
      });
    });
  });

  describe(SHELF_LOAD_QUERY, () => {
    it('correctly loads a field suggestion query', () => {
      const query = addCategoricalField.createQuery({spec: {mark: '?', encodings: []}});
      expect(
        shelfReducer({
          ...DEFAULT_SHELF
        }, {
          type: SHELF_LOAD_QUERY,
          payload: {query}
        }),
      ).toEqual({
        ...DEFAULT_SHELF,
        spec: {
          ...DEFAULT_SHELF_UNIT_SPEC,
          anyEncodings: [{
            channel: '?',
            field: '?',
            type: 'nominal',
            description: 'Categorical Fields'
          }]
        }
      });
    });

    it('correctly loads a related summaries query', () => {
      const query = summaries.createQuery({
        spec: {
          mark: '?',
          encodings: [{
            channel: 'x', field: 'displacement', type: 'quantitative'
          }]
        }
      });
      expect(
        shelfReducer({
          ...DEFAULT_SHELF,
          autoAddCount: false
        }, {
          type: SHELF_LOAD_QUERY,
          payload: {query}
        }),
      ).toEqual({
        ...DEFAULT_SHELF,
        spec: {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {fn: {enum: ['bin', 'mean']}, field: 'displacement', type: 'quantitative'}
          }
        }
      });
    });
  });

  describe(SPEC_LOAD, () => {
    const specLoadKeepWildcardMark: SpecLoad = {
      type: SPEC_LOAD,
      payload: {
        spec: {
          mark: 'bar',
          encoding: {
            x: {field: 'b', type: 'nominal'},
            y: {aggregate: 'count', field: '*', type: 'quantitative'}
          },
          data: {
            format: {
              parse: 'auto',
              type: 'json'
            },
            name: 'testName'
          }
        },
        keepWildcardMark: true
      }
    };

    it('loads spec and retains wildcard mark if the shelf has wildcard mark and keep wildcard mark is true', () => {
      const shelfSpec = shelfReducer(DEFAULT_SHELF, specLoadKeepWildcardMark);

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF,
        spec: {
          ...DEFAULT_SHELF_UNIT_SPEC,
          mark: SHORT_WILDCARD,
          encoding: {
            x: {field: 'b', type: 'nominal'},
            y: {field: '*', fn: 'count', type: 'quantitative'}
          }
        }
      });
    });

    it('completely loads spec if the shelf has no wildcard mark', () => {
      const shelfSpec = shelfReducer(
        {
          ...DEFAULT_SHELF,
          spec: {
            ...DEFAULT_SHELF_UNIT_SPEC,
            mark: 'point'
          }
        },
        specLoadKeepWildcardMark
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF,
        spec: {
          ...DEFAULT_SHELF_UNIT_SPEC,
          mark: 'bar',
          encoding: {
            x: {field: 'b', type: 'nominal'},
            y: {fn: 'count', field: '*', type: 'quantitative'}
          }
        }
      });
    });

    it('resets auto add count and groupBy', () => {
      const shelfSpec = shelfReducer(
        {
          ...DEFAULT_SHELF,
          groupBy: 'field',
          autoAddCount: false
        },
        {
          type: SPEC_LOAD,
          payload: {
            spec: {
              mark: 'bar',
              encoding: {},
              data: {
                format: {
                  parse: 'auto',
                  type: 'json'
                },
                name: 'testName'
              }
            },
            keepWildcardMark: true
          }
        }
      );

      expect(shelfSpec.groupBy).toEqual(DEFAULT_SHELF.groupBy);
      expect(shelfSpec.autoAddCount).toEqual(DEFAULT_SHELF.autoAddCount);
    });

    const filter = {field: 'a', oneOf: ['a', 'b']};
    it('do not change filter object if the loaded filter is the same', () => {
      const oldShelf: Shelf = {
        ...DEFAULT_SHELF,
        filters: [filter]
      };
      const shelfSpec = shelfReducer(
        oldShelf,
        {
          type: SPEC_LOAD,
          payload: {
            spec: {
              mark: 'bar',
              transform: [{filter}],
              encoding: {},
              data: {
                format: {
                  parse: 'auto',
                  type: 'json'
                },
                name: 'testName'
              }
            },
            keepWildcardMark: true
          }
        }
      );

      expect(shelfSpec.filters).toBe(oldShelf.filters);
    });

    it('loads filter object if the loaded filter is different', () => {
      const shelfSpec = shelfReducer(
        DEFAULT_SHELF,
        {
          type: SPEC_LOAD,
          payload: {
            spec: {
              mark: 'bar',
              transform: [{filter}],
              encoding: {},
              data: {
                format: {
                  parse: 'auto',
                  type: 'json'
                },
                name: 'testName'
              }
            },
            keepWildcardMark: true
          }
        }
      );

      expect(shelfSpec.filters).toEqual([filter]);
    });
  });
});
