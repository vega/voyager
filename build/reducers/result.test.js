"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var result_1 = require("../actions/result");
var result_2 = require("../models/result");
var result_3 = require("./result");
describe('reducers/result', function () {
    describe(result_1.RESULT_REQUEST, function () {
        var resultIndex = __assign({}, result_2.DEFAULT_RESULT_INDEX, { 
            // This is not really sensible state, but just to mock the reset behavior
            summaries: { isLoading: true, modelGroup: undefined, query: undefined } });
        it('updates the provided result with isLoading = true for a non-main result type', function () {
            expect(result_3.resultIndexReducer(resultIndex, {
                type: result_1.RESULT_REQUEST,
                payload: { resultType: 'summaries' }
            })).toEqual(__assign({}, resultIndex, { summaries: {
                    isLoading: true,
                    modelGroup: undefined,
                    query: undefined
                } }));
        });
        it('resets the result index and update main result with isLoading = true for main result type', function () {
            expect(result_3.resultIndexReducer(resultIndex, {
                type: result_1.RESULT_REQUEST,
                payload: { resultType: 'main' }
            })).toEqual(__assign({}, result_2.DEFAULT_RESULT_INDEX, { main: {
                    isLoading: true,
                    modelGroup: undefined,
                    query: undefined
                } }));
        });
    });
    describe(result_1.RESULT_RECEIVE, function () {
        it('returns new compass state with isLoading=false and new recommends', function () {
            var modelGroup = {}; // Mock
            var query = { spec: {} };
            expect(result_3.resultIndexReducer(__assign({}, result_2.DEFAULT_RESULT_INDEX, { main: {
                    isLoading: true,
                    modelGroup: undefined,
                    query: undefined
                } }), {
                type: result_1.RESULT_RECEIVE,
                payload: {
                    resultType: 'main',
                    modelGroup: modelGroup,
                    query: query // Mock
                }
            })).toEqual(__assign({}, result_2.DEFAULT_RESULT_INDEX, { main: {
                    isLoading: false,
                    modelGroup: modelGroup,
                    query: query
                } }));
        });
    });
});
