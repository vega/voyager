import {
  SHELF_CLEAR, SHELF_FIELD_ADD, SHELF_FIELD_AUTO_ADD, SHELF_FIELD_MOVE, SHELF_FIELD_REMOVE, SHELF_FUNCTION_ADD_WILDCARD,
  SHELF_FUNCTION_CHANGE, SHELF_FUNCTION_DISABLE_WILDCARD, SHELF_FUNCTION_ENABLE_WILDCARD,
  SHELF_FUNCTION_REMOVE_WILDCARD, SHELF_MARK_CHANGE_TYPE
} from '../../actions/shelf';
import {DEFAULT_SHELF_UNIT_SPEC} from '../../models';
import {shelfSpecReducer} from './spec';



const SHORT_WILDCARD = '?';
// FIXME doing property import can break the test
// import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
import {Schema} from 'compassql/build/src/schema';
import {SHELF_SPEC_LOAD} from '../../actions/shelf';

const schema = new Schema({fields: []});

describe('reducers/shelf/spec', () => {
  describe(SHELF_CLEAR, () => {
    it('should return DEFAULT_SHELF_UNIT_SPEC', () => {
      expect(
        shelfSpecReducer({
          mark: 'bar', encoding: {}, anyEncodings: [], config: {}, filters: []
        }, {type: SHELF_CLEAR}, schema),
      ).toBe(DEFAULT_SHELF_UNIT_SPEC);
    });
  });

  describe(SHELF_MARK_CHANGE_TYPE, () => {
    it('should return shelf spec with new mark', () => {
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SHELF_MARK_CHANGE_TYPE,
          payload: 'area'
        },
        schema
      );
      expect(shelfSpec.mark).toBe('area');
    });
  });

  describe(SHELF_FIELD_ADD, () => {
    it('should correctly add field to channel', () => {
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SHELF_FIELD_ADD,
          payload: {
            shelfId: {channel: 'x'},
            fieldDef: {field: 'a', type: 'quantitative'},
            replace: true
          }
        },
        schema
      );
      expect(shelfSpec.encoding.x).toEqual({field: 'a', type: 'quantitative'});
    });

    it('should correctly add field to wildcard channel', () => {
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SHELF_FIELD_ADD,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 0},
            fieldDef: {field: 'a', type: 'quantitative'},
            replace: true
          }
        },
        schema
      );
      expect(shelfSpec.anyEncodings[0]).toEqual({channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'});

      const insertedShelf = shelfSpecReducer(
        shelfSpec,
        {
          type: SHELF_FIELD_ADD,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 1},
            fieldDef: {field: 'b', type: 'quantitative'},
            replace: true
          }
        },
        schema
      );
      expect(insertedShelf.anyEncodings[0]).toEqual({channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'});
      expect(insertedShelf.anyEncodings[1]).toEqual({channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'});
    });

    it('should correctly replace field when dragging onto an existing wildcard shelf', () => {
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SHELF_FIELD_ADD,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 0},
            fieldDef: {field: 'a', type: 'quantitative'},
            replace: true
          }
        },
        schema
      );
      expect(shelfSpec.anyEncodings[0]).toEqual({channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'});

      const insertedShelf = shelfSpecReducer(
        shelfSpec,
        {
          type: SHELF_FIELD_ADD,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 0},
            fieldDef: {field: 'b', type: 'quantitative'},
            replace: true
          }
        },
        schema
      );
      expect(insertedShelf.anyEncodings[0]).toEqual({channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'});
    });
  });

  describe(SHELF_FIELD_ADD, () => {
    it('should query for new spec with CompassQL if there is no wildcard channel in the shelf ' +
        'and the field is not a wildcard.', () => {
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SHELF_FIELD_AUTO_ADD,
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
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          anyEncodings: [
            {channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'}
          ]
        },
        {
          type: SHELF_FIELD_AUTO_ADD,
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
      const shelfSpec = shelfSpecReducer(
        DEFAULT_SHELF_UNIT_SPEC,
        {
          type: SHELF_FIELD_AUTO_ADD,
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

  describe(SHELF_FIELD_REMOVE, () => {
    it('should correctly remove field from channel', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FIELD_REMOVE,
          payload: {channel: 'x'}
        },
        schema
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
          type: SHELF_FIELD_REMOVE,
          payload: {
            channel: SHORT_WILDCARD,
            index: 0
          }
        },
        schema
      );
      expect(shelfSpec).toEqual(DEFAULT_SHELF_UNIT_SPEC);
    });
  });

  describe(SHELF_FIELD_MOVE, () => {
    it('should correct move field to an empty channel', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FIELD_MOVE,
          payload: {
            from: {channel: 'x'},
            to: {channel: 'y' }
          }
        },
        schema
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
          type: SHELF_FIELD_MOVE,
          payload: {
            from: {channel: 'x'},
            to: {channel: 'y' }
          }
        },
        schema
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
          type: SHELF_FIELD_MOVE,
          payload: {
            from: {channel: 'x'},
            to: {channel: SHORT_WILDCARD, index: 0}
          }
        },
        schema
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
          type: SHELF_FIELD_MOVE,
          payload: {
            from: {channel: 'x'},
            to: {channel: SHORT_WILDCARD, index: 0}
          }
        },
        schema
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
          type: SHELF_FIELD_MOVE,
          payload: {
            from: {channel: SHORT_WILDCARD, index: 0},
            to: {channel: 'x'}
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
  });

  describe(SHELF_FUNCTION_DISABLE_WILDCARD, () => {
    it('should correctly convert back to a specific function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {},
          anyEncodings: [
            {aggregate: {name: 'aggregate', enum: ['min', 'mean', 'median']}, channel: '?', field: 'a'}
          ]
        },
        {
          type: SHELF_FUNCTION_DISABLE_WILDCARD,
          payload: {
            shelfId: {channel: '?', index: 0},
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {aggregate: 'min', channel: '?', field: 'a'}
        ]
      });
    });

    it('should correctly convert back to a specific function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {},
          anyEncodings: [
            {aggregate: {name: 'aggregate', enum: ['mean', 'median']}, bin: '?', channel: '?', field: 'a'}
          ]
        },
        {
          type: SHELF_FUNCTION_DISABLE_WILDCARD,
          payload: {
            shelfId: {channel: '?', index: 0},
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {bin: true, channel: '?', field: 'a'}
        ]
      });
    });

    it('should correctly convert back to a specific function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {aggregate: {name: 'aggregate', enum: ['min', 'mean', 'median']}, field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_DISABLE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {aggregate: 'min', field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly convert back to a specific function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {
              aggregate: {name: 'aggregate', enum: ['mean', 'median']},
              bin: '?',
              timeUnit: {name: 'timeUnit', enum: ['year']},
              field: 'a',
              type: 'quantitative'
            }
          }
        },
        {
          type: SHELF_FUNCTION_DISABLE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {bin: true, field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly convert back to a specific function when no wildcard functions were selected', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_DISABLE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
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
  });

  describe(SHELF_FUNCTION_ENABLE_WILDCARD, () => {
    it('should correctly convert the current function to a wildcard enum when wildcard button is enabled', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {},
          anyEncodings: [
            {aggregate: 'mean', channel: '?', field: 'a'}
          ]
        },
        {
          type: SHELF_FUNCTION_ENABLE_WILDCARD,
          payload: {
            shelfId: {channel: '?', index: 0},
            fn: 'mean'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {aggregate: {name: 'aggregate', enum: ['mean']}, channel: '?', field: 'a'}
        ]
      });
    });

    it('should correctly convert the current function to a wildcard enum when wildcard button is enabled', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {aggregate: 'mean', field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_ENABLE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'mean'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {aggregate: {name: 'aggregate', enum: ['mean']}, field: 'a', type: 'quantitative'}
        }
      });
    });
  });

  describe(SHELF_FUNCTION_ADD_WILDCARD, () => {
    it('should correctly add a wildcard function to anyEncodings when none is selected', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {},
          anyEncodings: [
            {channel: '?', field: 'a'}
          ]
        },
        {
          type: SHELF_FUNCTION_ADD_WILDCARD,
          payload: {
            shelfId: {channel: '?', index: 0},
            fn: 'mean'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {aggregate: {name: 'aggregate', enum: ['mean']}, channel: '?', field: 'a'}
        ]
      });
    });


    it('should correctly add a wildcard function when none is selected', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_ADD_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'mean'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {aggregate: {name: 'aggregate', enum: ['mean']}, field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly add a wildcard function to anyEncodings when wildcard functions are already selected', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {},
          anyEncodings: [
            {aggregate: {name: 'aggregate', enum: ['median']}, channel: '?', field: 'a'}
          ]
        },
        {
          type: SHELF_FUNCTION_ADD_WILDCARD,
          payload: {
            shelfId: {channel: '?', index: 0},
            fn: 'mean'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {aggregate: {name: 'aggregate', enum: ['mean', 'median']}, channel: '?', field: 'a'}
        ]
      });
    });

    it('should correctly add a wildcard function when wildcard functions are already selected', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {
              aggregate: {
                name: 'aggregate',
                enum: ['median']
              },
              timeUnit: {
                name: 'timeUnit',
                enum: ['yearmonth']
              },
              field: 'a',
              type: 'quantitative'
            }
          }
        },
        {
          type: SHELF_FUNCTION_ADD_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'mean'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {
            aggregate: {
              name: 'aggregate',
              enum: ['mean', 'median']
            },
            timeUnit: {
              name: 'timeUnit',
              enum: ['yearmonth']
            },
            field: 'a',
            type: 'quantitative'
          }
        }
      });
    });
  });

  describe(SHELF_FUNCTION_REMOVE_WILDCARD, () => {
    it('should correctly remove a wildcard function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {aggregate: {name: 'aggregate', enum: ['mean']}, bin: '?', field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_REMOVE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'mean'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', bin: '?', type: 'quantitative'}
        }
      });
    });

    it('should correctly remove a wildcard function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {aggregate: {name: 'aggregate', enum: ['mean']}, bin: '?', field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_REMOVE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'mean'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {field: 'a', bin: '?', type: 'quantitative'}
        }
      });
    });

    it('should correctly remove a wildcard function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {aggregate: {name: 'aggregate', enum: ['mean', 'median']}, bin: '?', field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_REMOVE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'mean'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {aggregate: {name: 'aggregate', enum: ['median']}, bin: '?', field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly remove a wildcard function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {aggregate: {name: 'aggregate', enum: ['mean', 'median']}, bin: '?', field: 'a', type: 'quantitative'}
          }
        },
        {
          type: SHELF_FUNCTION_REMOVE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'bin'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {aggregate: {name: 'aggregate', enum: ['mean', 'median']}, field: 'a', type: 'quantitative'}
        }
      });
    });

    it('should correctly remove a wildcard function', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          encoding: {
            x: {
              aggregate: {
                name: 'aggregate',
                enum: ['mean', 'median']
              },
              bin: '?',
              timeUnit: {
                name: 'timeUnit',
                enum: ['year', 'month']
              },
              field: 'a',
              type: 'quantitative'
            }
          }
        },
        {
          type: SHELF_FUNCTION_REMOVE_WILDCARD,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'month'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {
            aggregate: {
              name: 'aggregate',
              enum: ['mean', 'median']
            },
            bin: '?',
            timeUnit: {
              name: 'timeUnit',
              enum: ['year']
            },
            field: 'a',
            type: 'quantitative'
          }
        }
      });
    });
  });

  describe(SHELF_FUNCTION_CHANGE, () => {
    it('should correctly change function of x-field to aggregate:mean', () => {
      const shelfSpec = shelfSpecReducer(
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
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {aggregate: 'mean', field: 'a', type: 'quantitative'}
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
          type: SHELF_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'month'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {timeUnit: 'month', field: 'a', type: 'temporal'}
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
          type: SHELF_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: 'x'},
            fn: 'bin'
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        encoding: {
          x: {bin: true, field: 'a', type: 'quantitative'}
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
          type: SHELF_FUNCTION_CHANGE,
          payload: {
            shelfId: {channel: SHORT_WILDCARD, index: 0},
            fn: 'mean'
          }
        },
      schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        anyEncodings: [
          {aggregate: 'mean', channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'}
        ]
      });
    });

    it('should correctly change function of x-field to no function', () => {
      const shelfSpec = shelfSpecReducer(
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
  });

  describe(SHELF_SPEC_LOAD, () => {
    it('loads spec and retains wildcard mark if the shelf has wildcard mark', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          mark: SHORT_WILDCARD
        },
        {
          type: SHELF_SPEC_LOAD,
          payload: {
            spec: {
              mark: 'bar',
              encoding: {
                x: {field: 'b', type: 'nominal'},
                y: {aggregate: 'count', type: 'quantitative'}
              }
            }
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        mark: SHORT_WILDCARD,
        encoding: {
          x: {field: 'b', type: 'nominal'},
          y: {aggregate: 'count', type: 'quantitative'}
        }
      });
    });

    it('completely loads spec if the shelf has no wildcard mark', () => {
      const shelfSpec = shelfSpecReducer(
        {
          ...DEFAULT_SHELF_UNIT_SPEC,
          mark: 'point'
        },
        {
          type: SHELF_SPEC_LOAD,
          payload: {
            spec: {
              mark: 'bar',
              encoding: {
                x: {field: 'b', type: 'nominal'},
                y: {aggregate: 'count', type: 'quantitative'}
              }
            }
          }
        },
        schema
      );

      expect(shelfSpec).toEqual({
        ...DEFAULT_SHELF_UNIT_SPEC,
        mark: 'bar',
        encoding: {
          x: {field: 'b', type: 'nominal'},
          y: {aggregate: 'count', type: 'quantitative'}
        }
      });
    });
  });
});
