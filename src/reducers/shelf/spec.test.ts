import {Schema} from 'compassql/build/src/schema';
import {
  SPEC_CLEAR, SPEC_FIELD_ADD, SPEC_FIELD_AUTO_ADD, SPEC_FIELD_MOVE,
  SPEC_FIELD_REMOVE, SPEC_FUNCTION_CHANGE, SPEC_MARK_CHANGE_TYPE, SPEC_VALUE_CHANGE
} from '../../actions/shelf';
import {
  SPEC_FIELD_NESTED_PROP_CHANGE,
  SPEC_FIELD_PROP_CHANGE,
  SPEC_FUNCTION_ADD_WILDCARD,
  SPEC_FUNCTION_DISABLE_WILDCARD,
  SPEC_FUNCTION_ENABLE_WILDCARD,
  SPEC_FUNCTION_REMOVE_WILDCARD,
  SpecFieldNestedPropChange
} from '../../actions/shelf/spec';
import {DEFAULT_SHELF_UNIT_SPEC} from '../../models';
import {ShelfId} from '../../models/shelf/spec';
import {shelfSpecFieldAutoAddReducer, shelfSpecReducer} from './spec';

const SHORT_WILDCARD = '?';

const schema = new Schema({fields: []});

describe('reducers/shelf/spec', () => {
  describe(SPEC_CLEAR, () => {
    it('should return DEFAULT_SHELF_UNIT_SPEC', () => {
      expect(
        shelfSpecReducer({
          mark: 'bar', encoding: {}, anyEncodings: [], config: {}
        }, {type: SPEC_CLEAR}),
      ).toBe(DEFAULT_SHELF_UNIT_SPEC);
    });
  });

  describe(SPEC_MARK_CHANGE_TYPE, () => {
    it('should return shelf spec with new mark', () => {
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SPEC_MARK_CHANGE_TYPE,
          payload: 'area'
        },
      );
      expect(shelfSpec.mark).toBe('area');
    });
  });

  describe(SPEC_FIELD_ADD, () => {
    it('should correctly add field to channel', () => {
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SPEC_FIELD_ADD,
          payload: {
            shelfId: {channel: 'x'},
            fieldDef: {field: 'a', type: 'quantitative'},
            replace: true
          }
        },
      );

      expect(shelfSpec.encoding.x).toEqual({
        field: 'a', type: 'quantitative'
      });
    });

    it('should correctly add field to wildcard channel', () => {
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SPEC_FIELD_ADD,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 0},
            fieldDef: {field: 'a', type: 'quantitative'},
            replace: true
          }
        },
      );

      expect(shelfSpec.anyEncodings[0]).toEqual({
        channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'
      });

      const insertedShelf = shelfSpecReducer(
        shelfSpec,
        {
          type: SPEC_FIELD_ADD,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 1},
            fieldDef: {field: 'b', type: 'quantitative'},
            replace: true
          }
        },
      );

      expect(insertedShelf.anyEncodings[0]).toEqual({
        channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'
      });
      expect(insertedShelf.anyEncodings[1]).toEqual({
        channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'
      });
    });

    it('should correctly replace field when dragging onto an existing wildcard shelf', () => {
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SPEC_FIELD_ADD,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 0},
            fieldDef: {field: 'a', type: 'quantitative'},
            replace: true
          }
        },
      );

      expect(shelfSpec.anyEncodings[0]).toEqual({
        channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'
      });

      const insertedShelf = shelfSpecReducer(
        shelfSpec,
        {
          type: SPEC_FIELD_ADD,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 0},
            fieldDef: {field: 'b', type: 'quantitative'},
            replace: true
          }
        },
      );

      expect(insertedShelf.anyEncodings[0]).toEqual({
        channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'
      });
    });
  });

  describe(SPEC_FIELD_REMOVE, () => {
    it('should correctly remove field from channel', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FIELD_REMOVE,
          payload: {channel: 'x'}
        },
      );
      expect(shelfSpec).toEqual(DEFAULT_SHELF_UNIT_SPEC);
    });

    it('should correctly remove field from wildcard channel shelf', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          anyEncodings: [
            {channel: '?', field: 'a', type: 'quantitative'}
          ]
        },
        {
          type: SPEC_FIELD_REMOVE,
          payload: {
            channel: SHORT_WILDCARD,
            index: 0
          }
        },
      );
      expect(shelfSpec).toEqual(DEFAULT_SHELF_UNIT_SPEC);
    });
  });

  describe(SPEC_FIELD_MOVE, () => {
    it('should correct move field to an empty channel', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FIELD_MOVE,
          payload: {
            from: {channel: 'x'},
            to: {channel: 'y'}
          }
        },
      );
      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          y: {field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly swap field to if move to a non-empty channel', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'},
            y: {field: 'b', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FIELD_MOVE,
          payload: {
            from: {channel: 'x'},
            to: {channel: 'y'}
          }
        },
      );
      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'b', type: 'quantitative'},
          y: {field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly swap field between non-wildcard channel and wildcard channel', () => {
      const shelfSpec = shelfSpecReducer(
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
          type: SPEC_FIELD_MOVE,
          payload: {
            from: {channel: 'x'},
            to: {channel: SHORT_WILDCARD, index: 0}
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'b', type: 'quantitative'}
        },
        anyEncodings: [
          {channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'}
        ]
      });
    });

    it('should correctly move field from non-wildcard channel to and empty wildcard channel', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FIELD_MOVE,
          payload: {
            from: {channel: 'x'},
            to: {channel: SHORT_WILDCARD, index: 0}
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'}
        ]
      });
    });

    it('correctly moves field from a wildcard channel to and a non-wildcard channel', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          anyEncodings: [
            {channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'}
          ]
        },
        {
          type: SPEC_FIELD_MOVE,
          payload: {
            from: {channel: SHORT_WILDCARD, index: 0},
            to: {channel: 'x'}
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        }
      });
    });
  });

  describe(SPEC_FIELD_PROP_CHANGE, () => {
    it('should correctly change sort of x-field to "descending"', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FIELD_PROP_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            prop: 'sort',
            value: 'descending'
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', type: 'quantitative', sort: 'descending'}
        }
      });
    });

    it('should correctly change sort of x-field to undefined', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FIELD_PROP_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            prop: 'sort',
            value: undefined
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        }
      });
    });
  });

  describe(SPEC_FIELD_NESTED_PROP_CHANGE, () => {
    it('should correctly change scale type of x-field to "log"', () => {
      const action: SpecFieldNestedPropChange<'scale', 'type'> = {
        type: SPEC_FIELD_NESTED_PROP_CHANGE,
        payload: {
          shelfId: {channel: 'x'},
          prop: 'scale',
          nestedProp: 'type',
          value: 'log'
        }
      };
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        action,
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', type: 'quantitative', scale: {type: 'log'}}
        }
      });
    });

    it('should correctly remove scale type', () => {
      const action: SpecFieldNestedPropChange<'scale', 'type'> = {
        type: SPEC_FIELD_NESTED_PROP_CHANGE,
        payload: {
          shelfId: {channel: 'x'},
          prop: 'scale',
          nestedProp: 'type',
          value: undefined
        }
      };
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative', scale: {type: 'log'}}
          }
        },
        action,
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        }
      });
    });
  });

  describe(SPEC_FUNCTION_CHANGE, () => {
    it('should correctly change function of x-field to aggregate:mean', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'mean'
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {fn: 'mean', field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly change function of x-field to timeUnit:month', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'temporal'}
          }
        },
        {
          type: SPEC_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'month'
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {fn: 'month', field: 'a', type: 'temporal'}
        }
      });
    });

    it('should correctly change function of x-field to bin:true', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'bin'
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {fn: 'bin', field: 'a', type: 'quantitative'} // what do we do for bin????
        }
      });
    });

    it('should correctly change function of field with wildcard shelf to mean', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          anyEncodings: [
            {channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'}
          ]
        },
        {
          type: SPEC_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 0},
            fn: 'mean'
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {fn: 'mean', channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'}
        ]
      });
    });

    it('should correctly change function of x-field to no function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {fn: 'mean', field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            fn: undefined
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        }
      });
    });
  });

  describe(SPEC_FUNCTION_ADD_WILDCARD, () => {
    it('should correctly add a quantitative function to enum', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {fn: {enum: ['sum']}, field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FUNCTION_ADD_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'bin'
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', fn: {enum: ['bin', 'sum']}, type: 'quantitative'}
        }
      });
    });

    it('should correctly add a temporal function to enum', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {fn: {enum: ['year']}, field: 'a', type: 'temporal'}
          }
        },
        {
          type: SPEC_FUNCTION_ADD_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: undefined
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', fn: {enum: [undefined, 'year']}, type: 'temporal'}
        }
      });
    });
  });

  describe(SPEC_FUNCTION_DISABLE_WILDCARD, () => {
    it('should assign undefined to fn when nothing is enumerated', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {fn: {enum: []}, field: 'a', type: 'temporal'}
          }
        },
        {
          type: SPEC_FUNCTION_DISABLE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', type: 'temporal'}
        }
      });
    });

    it('should assign the first enum value to fn when wildcard is disabled', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {fn: {enum: ['mean', 'median', 'sum']}, field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FUNCTION_DISABLE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', fn: 'mean', type: 'quantitative'}
        }
      });
    });
  });

  describe(SPEC_FUNCTION_ENABLE_WILDCARD, () => {
    it('should correctly change an aggregate function to wildcard', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {fn: 'mean', field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FUNCTION_ENABLE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'}
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', fn: {enum: ['mean']}, type: 'quantitative'}
        }
      });
    });

    it('should correctly change a temporal function to wildcard', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {fn: 'year', field: 'a', type: 'temporal'}
          }
        },
        {
          type: SPEC_FUNCTION_ENABLE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'}
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', fn: {enum: ['year']}, type: 'temporal'}
        }
      });
    });

    it('should correctly change undefined to wildcard', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FUNCTION_ENABLE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'}
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', fn: {enum: [undefined]}, type: 'quantitative'}
        }
      });
    });
  });

  describe(SPEC_FUNCTION_REMOVE_WILDCARD, () => {
    it('should remove a wildcard function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {fn: {enum: [undefined, 'mean', 'median', 'sum']}, field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SPEC_FUNCTION_REMOVE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: undefined
          }
        },
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', fn: {enum: ['mean', 'median', 'sum']}, type: 'quantitative'}
        }
      });
    });
  });

  describe(SPEC_VALUE_CHANGE, () => {
    it('should change the constant value for a channel', () => {
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SPEC_VALUE_CHANGE,
          payload: {
            shelfId: {channel: 'color'},
            valueDef: {value: 'blue'}
          }
        }
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          color: {value: 'blue'}
        }
      });
    });

    it('should throw error if value supplied for wildcard channel', () => {
      const shelfId: ShelfId = {
        channel: SHORT_WILDCARD,
        index: 0
      };

      expect(() => shelfSpecReducer(DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SPEC_VALUE_CHANGE,
          payload: {
            shelfId: shelfId,
            valueDef: {value: 'blue'}
          }
        })).toThrowError('constant value cannot be assigned to a wildcard channel');
    });
  });

  describe('shelfSpecFieldAutoAddReducer / ' + SPEC_FIELD_AUTO_ADD, () => {
    it('should query for new spec with CompassQL if there is no wildcard channel in the shelf ' +
      'and the field is not a wildcard.', () => {
      const shelfSpec = shelfSpecFieldAutoAddReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SPEC_FIELD_AUTO_ADD,
          payload: {
            fieldDef: {field: 'a', type: 'quantitative'}
          }
        },
        schema
      );
      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should add the field to anyEncodings if there is a wildcard channel in the shelf', () => {
      const shelfSpec = shelfSpecFieldAutoAddReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          anyEncodings: [
            {channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'}
          ]
        },
        {
          type: SPEC_FIELD_AUTO_ADD,
          payload: {
            fieldDef: {field: 'b', type: 'nominal'}
          }
        },
        schema
      );
      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'},
          {channel: SHORT_WILDCARD, field: 'b', type: 'nominal'}
        ]
      });
    });

    it('should add the field to anyEncodings if the field is a wildcard', () => {
      const shelfSpec = shelfSpecFieldAutoAddReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SPEC_FIELD_AUTO_ADD,
          payload: {
            fieldDef: {
              field: {enum: ['a', 'b']},

              type: 'nominal'
            }
          }
        },
        schema
      );
      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {channel: SHORT_WILDCARD, field: {enum: ['a', 'b']}, type: 'nominal'}
        ]
      });
    });
  });
});
