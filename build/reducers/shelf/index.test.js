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
var wildcard_1 = require("compassql/build/src/wildcard");
var actions_1 = require("../../actions");
var index_1 = require("../../actions/shelf/index");
var spec_1 = require("../../actions/shelf/spec");
var index_2 = require("../../models/shelf/index");
var index_3 = require("../../models/shelf/spec/index");
var field_suggestions_1 = require("../../queries/field-suggestions");
var summaries_1 = require("../../queries/summaries");
var index_4 = require("./index");
describe('reducers/shelf', function () {
    describe(index_1.SHELF_AUTO_ADD_COUNT_CHANGE, function () {
        it('changes autoAddCount', function () {
            expect(index_4.shelfReducer(__assign({}, index_2.DEFAULT_SHELF), {
                type: index_1.SHELF_AUTO_ADD_COUNT_CHANGE,
                payload: { autoAddCount: false }
            })).toEqual(__assign({}, index_2.DEFAULT_SHELF, { autoAddCount: false }));
        });
    });
    describe(index_1.SHELF_GROUP_BY_CHANGE, function () {
        it('changes autoAddCount', function () {
            expect(index_4.shelfReducer(__assign({}, index_2.DEFAULT_SHELF), {
                type: index_1.SHELF_GROUP_BY_CHANGE,
                payload: { groupBy: 'encoding' }
            })).toEqual(__assign({}, index_2.DEFAULT_SHELF, { groupBy: 'encoding' }));
        });
    });
    describe(actions_1.SHELF_LOAD_QUERY, function () {
        it('correctly loads a field suggestion query', function () {
            var query = field_suggestions_1.addCategoricalField.createQuery({ spec: { mark: '?', encodings: [] } });
            expect(index_4.shelfReducer(__assign({}, index_2.DEFAULT_SHELF), {
                type: actions_1.SHELF_LOAD_QUERY,
                payload: { query: query }
            })).toEqual(__assign({}, index_2.DEFAULT_SHELF, { spec: __assign({}, index_3.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [{
                            channel: '?',
                            field: '?',
                            type: 'nominal',
                            description: 'Categorical Fields'
                        }] }) }));
        });
        it('correctly loads a related summaries query', function () {
            var query = summaries_1.summaries.createQuery({
                spec: {
                    mark: '?',
                    encodings: [{
                            channel: 'x', field: 'displacement', type: 'quantitative'
                        }]
                }
            });
            expect(index_4.shelfReducer(__assign({}, index_2.DEFAULT_SHELF, { autoAddCount: false }), {
                type: actions_1.SHELF_LOAD_QUERY,
                payload: { query: query }
            })).toEqual(__assign({}, index_2.DEFAULT_SHELF, { spec: __assign({}, index_3.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                        x: { fn: { enum: ['bin', 'mean'] }, field: 'displacement', type: 'quantitative' }
                    } }) }));
        });
    });
    describe(spec_1.SPEC_LOAD, function () {
        var specLoadKeepWildcardMark = {
            type: spec_1.SPEC_LOAD,
            payload: {
                spec: {
                    mark: 'bar',
                    encoding: {
                        x: { field: 'b', type: 'nominal' },
                        y: { aggregate: 'count', field: '*', type: 'quantitative' }
                    },
                    data: {
                        format: {
                            parse: 'auto',
                            type: 'json'
                        },
                        name: 'testName'
                    }
                },
                keepWildcardMark: true
            }
        };
        it('loads spec and retains wildcard mark if the shelf has wildcard mark and keep wildcard mark is true', function () {
            var shelfSpec = index_4.shelfReducer(index_2.DEFAULT_SHELF, specLoadKeepWildcardMark);
            expect(shelfSpec).toEqual(__assign({}, index_2.DEFAULT_SHELF, { spec: __assign({}, index_3.DEFAULT_SHELF_UNIT_SPEC, { mark: wildcard_1.SHORT_WILDCARD, encoding: {
                        x: { field: 'b', type: 'nominal' },
                        y: { field: '*', fn: 'count', type: 'quantitative' }
                    } }) }));
        });
        it('completely loads spec if the shelf has no wildcard mark', function () {
            var shelfSpec = index_4.shelfReducer(__assign({}, index_2.DEFAULT_SHELF, { spec: __assign({}, index_3.DEFAULT_SHELF_UNIT_SPEC, { mark: 'point' }) }), specLoadKeepWildcardMark);
            expect(shelfSpec).toEqual(__assign({}, index_2.DEFAULT_SHELF, { spec: __assign({}, index_3.DEFAULT_SHELF_UNIT_SPEC, { mark: 'bar', encoding: {
                        x: { field: 'b', type: 'nominal' },
                        y: { fn: 'count', field: '*', type: 'quantitative' }
                    } }) }));
        });
        it('resets auto add count and groupBy', function () {
            var shelfSpec = index_4.shelfReducer(__assign({}, index_2.DEFAULT_SHELF, { groupBy: 'field', autoAddCount: false }), {
                type: spec_1.SPEC_LOAD,
                payload: {
                    spec: {
                        mark: 'bar',
                        encoding: {},
                        data: {
                            format: {
                                parse: 'auto',
                                type: 'json'
                            },
                            name: 'testName'
                        }
                    },
                    keepWildcardMark: true
                }
            });
            expect(shelfSpec.groupBy).toEqual(index_2.DEFAULT_SHELF.groupBy);
            expect(shelfSpec.autoAddCount).toEqual(index_2.DEFAULT_SHELF.autoAddCount);
        });
        var filter = { field: 'a', oneOf: ['a', 'b'] };
        it('do not change filter object if the loaded filter is the same', function () {
            var oldShelf = __assign({}, index_2.DEFAULT_SHELF, { filters: [filter] });
            var shelfSpec = index_4.shelfReducer(oldShelf, {
                type: spec_1.SPEC_LOAD,
                payload: {
                    spec: {
                        mark: 'bar',
                        transform: [{ filter: filter }],
                        encoding: {},
                        data: {
                            format: {
                                parse: 'auto',
                                type: 'json'
                            },
                            name: 'testName'
                        }
                    },
                    keepWildcardMark: true
                }
            });
            expect(shelfSpec.filters).toBe(oldShelf.filters);
        });
        it('loads filter object if the loaded filter is different', function () {
            var shelfSpec = index_4.shelfReducer(index_2.DEFAULT_SHELF, {
                type: spec_1.SPEC_LOAD,
                payload: {
                    spec: {
                        mark: 'bar',
                        transform: [{ filter: filter }],
                        encoding: {},
                        data: {
                            format: {
                                parse: 'auto',
                                type: 'json'
                            },
                            name: 'testName'
                        }
                    },
                    keepWildcardMark: true
                }
            });
            expect(shelfSpec.filters).toEqual([filter]);
        });
    });
});
//# sourceMappingURL=index.test.js.map