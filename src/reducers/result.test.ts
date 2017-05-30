import {SpecQueryGroup} from 'compassql/build/src/model';
import { PlotObject } from '../models/plot';


import {RESULT_RECEIVE, RESULT_REQUEST} from '../actions/result';
import {DEFAULT_RESULT_MAIN} from '../models/result';
import {mainResultReducer} from './result';

describe('reducers/compass', () => {
  describe(RESULT_REQUEST, () => {
    it('returns new compass state with isLoading = true', () => {
      expect(mainResultReducer(DEFAULT_RESULT_MAIN, {
        type: RESULT_REQUEST,
        payload: {}
      })).toEqual({
        ...DEFAULT_RESULT_MAIN,
        isLoading: true
      });
    });
  });

  describe(RESULT_RECEIVE, () => {
    it('returns new compass state with isLoading=false and new recommends', () => {
      const modelGroup = {} as SpecQueryGroup<PlotObject>; // Mock
      expect(mainResultReducer(
        {
          ...DEFAULT_RESULT_MAIN,
          isLoading: true
        },
        {
          type: RESULT_RECEIVE,
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
