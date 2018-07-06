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
            summaries: { isLoading: true, plots: undefined, query: undefined, limit: 5 } });
        it('updates the provided result with isLoading = true for a non-main result type', function () {
            expect(result_3.resultIndexReducer(resultIndex, {
                type: result_1.RESULT_REQUEST,
                payload: { resultType: 'summaries' }
            })).toEqual(__assign({}, resultIndex, { summaries: {
                    isLoading: true,
                    modelGroup: undefined,
                    query: undefined,
                    limit: result_3.DEFAULT_LIMIT.summaries
                } }));
        });
        it('resets the result index and update main result with isLoading = true for main result type', function () {
            expect(result_3.resultIndexReducer(resultIndex, {
                type: result_1.RESULT_REQUEST,
                payload: { resultType: 'main' }
            })).toEqual(__assign({}, result_2.DEFAULT_RESULT_INDEX, { main: {
                    isLoading: true,
                    modelGroup: undefined,
                    query: undefined,
                    limit: result_3.DEFAULT_LIMIT.main
                } }));
        });
    });
    describe(result_1.RESULT_RECEIVE, function () {
        it('returns new compass state with isLoading=false and new recommends', function () {
            var plots = [{}]; // Mock
            var query = { spec: {} };
            expect(result_3.resultIndexReducer(__assign({}, result_2.DEFAULT_RESULT_INDEX, { main: {
                    isLoading: true,
                    plots: undefined,
                    query: undefined,
                    limit: 25
                } }), {
                type: result_1.RESULT_RECEIVE,
                payload: {
                    resultType: 'main',
                    plots: plots,
                    query: query
                }
            })).toEqual(__assign({}, result_2.DEFAULT_RESULT_INDEX, { main: {
                    isLoading: false,
                    plots: plots,
                    query: query,
                    limit: 25
                } }));
        });
    });
    // FIXME: What to put for required Data?
    describe(result_1.RESULT_MODIFY_FIELD_PROP, function () {
        var plots = [{
                fieldInfos: null,
                spec: {
                    mark: 'point',
                    encoding: {
                        x: { field: 'a', type: 'quantitative' }
                    },
                    data: {
                        format: {
                            parse: 'auto',
                            type: 'json'
                        },
                        name: 'testName'
                    }
                }
            }];
        var resultIndex = __assign({}, result_2.DEFAULT_RESULT_INDEX, { 
            // This is not really sensible state, but just to mock the reset behavior
            summaries: { isLoading: true, plots: plots, query: undefined, limit: 5 } });
        it('updates the provided result with isLoading = true for a non-main result type', function () {
            var action = {
                type: result_1.RESULT_MODIFY_FIELD_PROP,
                payload: { resultType: 'summaries', index: 0, channel: 'x', prop: 'sort', value: 'descending' }
            };
            var newResultIndex = result_3.resultIndexReducer(resultIndex, action);
            expect(newResultIndex.summaries.plots[0].spec.encoding.x)
                .toEqual({ field: 'a', type: 'quantitative', sort: 'descending' });
        });
    });
    describe(result_1.RESULT_MODIFY_FIELD_PROP, function () {
        var plots = [{
                fieldInfos: null,
                spec: {
                    mark: 'point',
                    encoding: {
                        x: { field: 'a', type: 'quantitative' }
                    },
                    data: {
                        format: {
                            parse: 'auto',
                            type: 'json'
                        },
                        name: 'testName'
                    }
                }
            }];
        var resultIndex = __assign({}, result_2.DEFAULT_RESULT_INDEX, { 
            // This is not really sensible state, but just to mock the reset behavior
            summaries: { isLoading: true, plots: plots, query: undefined, limit: 5 } });
        it('updates the provided result with isLoading = true for a non-main result type', function () {
            var action = {
                type: result_1.RESULT_MODIFY_NESTED_FIELD_PROP,
                payload: { resultType: 'summaries', index: 0, channel: 'x', prop: 'scale', nestedProp: 'type', value: 'log' }
            };
            var newResultIndex = result_3.resultIndexReducer(resultIndex, action);
            expect(newResultIndex.summaries.plots[0].spec.encoding.x)
                .toEqual({ field: 'a', type: 'quantitative', scale: { type: 'log' } });
        });
    });
});
//# sourceMappingURL=result.test.js.map