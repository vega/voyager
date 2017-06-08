"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var result_1 = require("../actions/result");
var result_2 = require("../models/result");
var result_3 = require("./result");
describe('reducers/compass', function () {
    describe(result_1.RESULT_REQUEST, function () {
        it('returns new compass state with isLoading = true', function () {
            expect(result_3.mainResultReducer(result_2.DEFAULT_RESULT_MAIN, {
                type: result_1.RESULT_REQUEST,
                payload: {}
            })).toEqual(__assign({}, result_2.DEFAULT_RESULT_MAIN, { isLoading: true }));
        });
    });
    describe(result_1.RESULT_RECEIVE, function () {
        it('returns new compass state with isLoading=false and new recommends', function () {
            var modelGroup = {}; // Mock
            expect(result_3.mainResultReducer(__assign({}, result_2.DEFAULT_RESULT_MAIN, { isLoading: true }), {
                type: result_1.RESULT_RECEIVE,
                payload: {
                    modelGroup: modelGroup
                }
            })).toEqual(__assign({}, result_2.DEFAULT_RESULT_MAIN, { isLoading: false, modelGroup: modelGroup }));
        });
    });
});
