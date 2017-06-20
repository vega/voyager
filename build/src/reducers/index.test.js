"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../actions/index");
var index_2 = require("./index");
describe('reducers/index', function () {
    describe("Action Groups", function () {
        it('All actions should be in a group', function () {
            var actionsInIndex = [].concat(index_2.ACTIONS_EXCLUDED_FROM_HISTORY, index_2.GROUPED_ACTIONS, index_2.USER_ACTIONS);
            for (var _i = 0, ACTION_TYPES_1 = index_1.ACTION_TYPES; _i < ACTION_TYPES_1.length; _i++) {
                var action = ACTION_TYPES_1[_i];
                expect(actionsInIndex).toContain(action);
            }
        });
    });
});
