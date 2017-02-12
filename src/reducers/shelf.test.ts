import {SHORT_WILDCARD} from 'compassql/src/wildcard';

import {DEFAULT_SHELF_SPEC} from '../models';
import {shelfReducer} from './shelf';

describe('reducers/shelf', () => {
  describe('shelf-reset', () =>  {
    it('should return DEFAULT_SHELF_SPEC', () => {
      expect(
        shelfReducer({mark: 'bar', encoding: {}, anyEncodings: [], config: {}}, {type: 'shelf-reset'}),
      ).toBe(DEFAULT_SHELF_SPEC);
    });
  });

  describe('shelf-change-mark-type', () => {
    it('should return shelf spec with new mark', () => {
      const shelf = shelfReducer(DEFAULT_SHELF_SPEC, {type: 'shelf-change-mark-type', mark: 'area'});
      expect(shelf.mark).toBe('area');
    });
  });

  describe('shelf-field-add', () => {
    it('should correctly add field to channel', () => {
      const shelf = shelfReducer(
        DEFAULT_SHELF_SPEC,
        {type: 'shelf-field-add', channel: 'x', fieldDef: {field: 'a', type: 'quantitative'}}
      );
      expect(shelf.encoding.x).toEqual({field: 'a', type: 'quantitative'});
    });

    it('should correctly add field to wildcard channel', () => {
      const shelf = shelfReducer(
        DEFAULT_SHELF_SPEC,
        {type: 'shelf-field-add', channel: SHORT_WILDCARD, fieldDef: {field: 'a', type: 'quantitative'}}
      );
      expect(shelf.anyEncodings[0]).toEqual({channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'});
    });
  });

  describe('shelf-field-channel-remove', () => {
    it('should correctly remove field from channel', () => {
      const shelf = shelfReducer(
        {
          ...DEFAULT_SHELF_SPEC,
          encoding: {
            x: {field: 'a', type: 'quantitative'}
          }
        },
        {type: 'shelf-field-channel-remove', channel: 'x'}
      );
      expect(shelf).toEqual(DEFAULT_SHELF_SPEC);
    });
  });

  describe('shelf-field-wildcard-channel-remove', () => {
    it('should correctly remove field from wildcard channel shelf', () => {
      const shelf = shelfReducer(
        {
          ...DEFAULT_SHELF_SPEC,
          anyEncodings: [
            {channel: '?', field: 'a', type: 'quantitative'}
          ]
        },
        {type: 'shelf-field-wildcard-channel-remove', index: 0}
      );
      expect(shelf).toEqual(DEFAULT_SHELF_SPEC);
    });
  });

});
