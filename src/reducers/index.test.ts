import {ACTION_TYPES} from '../actions/index';
import {ACTIONS_EXCLUDED_FROM_HISTORY, GROUPED_ACTIONS, USER_ACTIONS} from './index';

describe('reducers/index', () => {
  describe("Action Groups", () => {
    it('All actions should be in a group', () => {
      const actionsInIndex = [].concat(
        ACTIONS_EXCLUDED_FROM_HISTORY,
        GROUPED_ACTIONS,
        USER_ACTIONS
      );

      for (const action of ACTION_TYPES) {
        expect(actionsInIndex).toContain(action);
      }
    });
  });
});

