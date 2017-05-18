import {SpecQueryModelGroup} from 'compassql/build/src/model';

import {COMPASS_RECOMMENDS_RECEIVE, COMPASS_RECOMMENDS_REQUEST} from '../actions/compass';
import {DEFAULT_COMPASS} from '../models/compass';
import {compassReducer} from './compass';

describe('reducers/compass', () => {
  describe(COMPASS_RECOMMENDS_REQUEST, () => {
    it('returns new compass state with isLoading = true', () => {
      expect(compassReducer(DEFAULT_COMPASS, {
        type: COMPASS_RECOMMENDS_REQUEST,
        payload: {}
      })).toEqual({
        ...DEFAULT_COMPASS,
        isLoading: true
      });
    });
  });

  describe(COMPASS_RECOMMENDS_RECEIVE, () => {
    it('returns new compass state with isLoading=false and new recommends', () => {
      const recommends = {} as SpecQueryModelGroup; // Mock
      expect(compassReducer(
        {
          ...DEFAULT_COMPASS,
          isLoading: true
        },
        {
          type: COMPASS_RECOMMENDS_RECEIVE,
          payload: {
            recommends
          }
        }
      )).toEqual({
        ...DEFAULT_COMPASS,
        isLoading: false,
        recommends
      });
    });
  });
});
