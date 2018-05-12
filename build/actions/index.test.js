"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
describe('actions/index', function () {
    describe('isVoyagerAction', function () {
        it('should return true for all Voyager actions', function () {
            index_1.ACTION_TYPES.forEach(function (actionType) {
                var action = { type: actionType };
                expect(index_1.isVoyagerAction(action)).toEqual(1);
            });
        });
        it('should return undefined for non-Voyager actions', function () {
            var action = { type: 'SOME_RANDOM_ACTION' };
            expect(index_1.isVoyagerAction(action)).toBeFalsy;
        });
    });
});
//# sourceMappingURL=index.test.js.map