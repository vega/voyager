import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';

import {
  SHELF_CLEAR, SHELF_FIELD_ADD, SHELF_FIELD_MOVE, SHELF_FIELD_REMOVE, SHELF_FUNCTION_CHANGE, SHELF_MARK_CHANGE_TYPE
} from '../../actions/shelf';
import {DEFAULT_SHELF_UNIT_SPEC} from '../../models';
import {shelfSpecReducer} from './spec';


describe('reducers/shelf', () => {
  describe(SHELF_CLEAR, () =>  {
    it('should return DEFAULT_SHELF_UNIT_SPEC', () => {
      expect(
        shelfSpecReducer({mark: 'bar', encoding: {}, anyEncodings: [], config: {}}, {type: SHELF_CLEAR}),
      ).toBe(DEFAULT_SHELF_UNIT_SPEC);
    });
  });

  describe(SHELF_MARK_CHANGE_TYPE, () => {
    it('should return shelf spec with new mark', () => {
      const shelf = shelfSpecReducer(DEFAULT_SHELF_UNIT_SPEC, {type: SHELF_MARK_CHANGE_TYPE, payload: 'area'});
      expect(shelf.mark).toBe('area');
    });
  });

  describe(SHELF_FIELD_ADD, () => {
    it('should correctly add field to channel', () => {
      const shelf = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SHELF_FIELD_ADD,
          payload: {shelfId: {channel: 'x'}, fieldDef: {field: 'a', type: 'quantitative'}}
        }
      );
      expect(shelf.encoding.x).toEqual({field: 'a', type: 'quantitative'});
    });

    it('should correctly add field to wildcard channel', () => {
      const shelf = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SHELF_FIELD_ADD,
          payload: {shelfId: {channel: SHORT_WILDCARD, index: 0}, fieldDef: {field: 'a', type: 'quantitative'}}
        }
      );
      expect(shelf.anyEncodings[0]).toEqual({channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'});

      const insertedShelf = shelfSpecReducer(
        shelf,
        {
          type: SHELF_FIELD_ADD,
          payload: {shelfId: {channel: SHORT_WILDCARD, index: 0}, fieldDef: {field: 'b', type: 'quantitative'}}
        }
      );
      expect(insertedShelf.anyEncodings[0]).toEqual({channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'});
      expect(insertedShelf.anyEncodings[1]).toEqual({channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'});
    });
  });

  describe(SHELF_FIELD_REMOVE, () => {
    it('should correctly remove field from channel', () => {
      const shelf = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {type: SHELF_FIELD_REMOVE, payload: {channel: 'x'}}
      );
      expect(shelf).toEqual(DEFAULT_SHELF_UNIT_SPEC);
    });

    it('should correctly remove field from wildcard channel shelf', () => {
      const shelf = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          anyEncodings: [
            {channel: '?', field: 'a', type: 'quantitative'}
          ]
        },
        {type: SHELF_FIELD_REMOVE, payload: {channel: SHORT_WILDCARD, index: 0}}
      );
      expect(shelf).toEqual(DEFAULT_SHELF_UNIT_SPEC);
    });
  });

  describe(SHELF_FIELD_MOVE, () => {
    it('should correct move field to an empty channel', () => {
      const shelf = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FIELD_MOVE,
          payload: {from: {channel: 'x'}, to: {channel: 'y' }}
        }
      );
      expect(shelf).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          y: {field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly swap field to if move to a non-empty channel', () => {
      const shelf = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'},
            y: {field: 'b', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FIELD_MOVE,
          payload: {from: {channel: 'x'}, to: {channel: 'y' }}
        }
      );
      expect(shelf).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'b', type: 'quantitative'},
          y: {field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly swap field between non-wildcard channel and wildcard channel', () => {
      const shelf = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          },
          anyEncodings: [
            {channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'}
          ]
        },
        {
          type: SHELF_FIELD_MOVE,
          payload: {
            from: {channel: 'x'},
            to: {channel: SHORT_WILDCARD, index: 0}
          }
        }
      );

      expect(shelf).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'b', type: 'quantitative'}
        },
        anyEncodings: [
          {channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'}
        ]
      });
    });
  });

  describe(SHELF_FUNCTION_CHANGE, () => {
    it('should correctly change function of x-field to aggregate:mean', () => {
      const shelf = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'mean'
          }
        }
      );

      expect(shelf).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {aggregate: 'mean', field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly change function of x-field to timeUnit:month', () => {
      const shelf = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'temporal'}
          }
        },
        {
          type: SHELF_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'month'
          }
        }
      );

      expect(shelf).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {timeUnit: 'month', field: 'a', type: 'temporal'}
        }
      });
    });

    it('should correctly change function of x-field to bin:true', () => {
      const shelf = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'bin'
          }
        }
      );

      expect(shelf).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {bin: true, field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly change function of field with wildcard shelf to mean', () => {
      const shelf = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          anyEncodings: [
            {channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'}
          ]
        },
        {
          type: SHELF_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 0},
            fn: 'mean'
          }
        }
      );

      expect(shelf).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {aggregate: 'mean', channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'}
        ]
      });
    });

    it('should correctly change function of x-field to no function', () => {
      const shelf = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {aggregate: 'mean', field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            fn: undefined
          }
        }
      );

      expect(shelf).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        }
      });
    });
  });
});
