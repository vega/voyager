import {SpecQueryModelGroup} from 'compassql/build/src/model';

import {RESULT_RECOMMENDS_RECEIVE, RESULT_RECOMMENDS_REQUEST} from '../actions/result';
import {DEFAULT_RESULT_MAIN} from '../models/result';
import {mainResultReducer} from './result';

describe('reducers/compass', () => {
  describe(RESULT_RECOMMENDS_REQUEST, () => {
    it('returns new compass state with isLoading = true', () => {
      expect(mainResultReducer(DEFAULT_RESULT_MAIN, {
        type: RESULT_RECOMMENDS_REQUEST,
        payload: {}
      })).toEqual({
        ...DEFAULT_RESULT_MAIN,
        isLoading: true
      });
    });
  });

  describe(RESULT_RECOMMENDS_RECEIVE, () => {
    it('returns new compass state with isLoading=false and new recommends', () => {
      const modelGroup = {} as SpecQueryModelGroup; // Mock
      expect(mainResultReducer(
        {
          ...DEFAULT_RESULT_MAIN,
          isLoading: true
        },
        {
          type: RESULT_RECOMMENDS_RECEIVE,
          payload: {
            modelGroup
          }
        }
      )).toEqual({
        ...DEFAULT_RESULT_MAIN,
        isLoading: false,
        modelGroup
      });
    });
  });
});
