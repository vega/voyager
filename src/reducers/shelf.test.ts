import {SHORT_WILDCARD} from 'compassql/src/wildcard';

import { SHELF_CLEAR, SHELF_FIELD_ADD, SHELF_FIELD_REMOVE, SHELF_MARK_CHANGE_TYPE } from '../actions/shelf';
import {DEFAULT_SHELF_SPEC} from '../models';
import {shelfReducer} from './shelf';


describe('reducers/shelf', () => {
  describe(SHELF_CLEAR, () =>  {
    it('should return DEFAULT_SHELF_SPEC', () => {
      expect(
        shelfReducer({mark: 'bar', encoding: {}, anyEncodings: [], config: {}}, {type: SHELF_CLEAR}),
      ).toBe(DEFAULT_SHELF_SPEC);
    });
  });

  describe(SHELF_MARK_CHANGE_TYPE, () => {
    it('should return shelf spec with new mark', () => {
      const shelf = shelfReducer(DEFAULT_SHELF_SPEC, {type: SHELF_MARK_CHANGE_TYPE, payload: 'area'});
      expect(shelf.mark).toBe('area');
    });
  });

  describe(SHELF_FIELD_ADD, () => {
    it('should correctly add field to channel', () => {
      const shelf = shelfReducer(
        DEFAULT_SHELF_SPEC,
        {
          type: SHELF_FIELD_ADD,
          payload: {shelfId: {channel: 'x'}, fieldDef: {field: 'a', type: 'quantitative'}}
        }
      );
      expect(shelf.encoding.x).toEqual({field: 'a', type: 'quantitative'});
    });

    it('should correctly add field to wildcard channel', () => {
      const shelf = shelfReducer(
        DEFAULT_SHELF_SPEC,
        {
          type: SHELF_FIELD_ADD,
          payload: {shelfId: {channel: SHORT_WILDCARD, index: 0}, fieldDef: {field: 'a', type: 'quantitative'}}
        }
      );
      expect(shelf.anyEncodings[0]).toEqual({channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'});
    });
  });

  describe(SHELF_FIELD_REMOVE, () => {
    it('should correctly remove field from channel', () => {
      const shelf = shelfReducer(
        {
          ...DEFAULT_SHELF_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {type: SHELF_FIELD_REMOVE, payload: {channel: 'x'}}
      );
      expect(shelf).toEqual(DEFAULT_SHELF_SPEC);
    });

    it('should correctly remove field from wildcard channel shelf', () => {
      const shelf = shelfReducer(
        {
          ...DEFAULT_SHELF_SPEC,
          anyEncodings: [
            {channel: '?', field: 'a', type: 'quantitative'}
          ]
        },
        {type: SHELF_FIELD_REMOVE, payload: {channel: SHORT_WILDCARD, index: 0}}
      );
      expect(shelf).toEqual(DEFAULT_SHELF_SPEC);
    });
  });

});
