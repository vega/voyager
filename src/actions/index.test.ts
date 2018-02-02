import { ACTION_TYPES, isVoyagerAction } from "./index";

describe('actions/index', () => {
  describe('isVoyagerAction', () => {
    it('should return true for all Voyager actions', () => {
      ACTION_TYPES.forEach(actionType => {
        const action = {type: actionType};
        expect(isVoyagerAction(action)).toEqual(1);
      });
    });

    it('should return undefined for non-Voyager actions', () => {
      const action = {type: 'SOME_RANDOM_ACTION'};
      expect(isVoyagerAction(action)).toBeFalsy;
    });
  });
});
