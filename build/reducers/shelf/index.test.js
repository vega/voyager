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
var schema_1 = require("compassql/build/src/schema");
var actions_1 = require("../../actions");
var index_1 = require("../../actions/shelf/index");
var index_2 = require("../../models/shelf/index");
var index_3 = require("../../models/shelf/spec/index");
var field_suggestions_1 = require("../../queries/field-suggestions");
var summaries_1 = require("../../queries/summaries");
var index_4 = require("./index");
describe('reducers/shelf', function () {
    var schema = new schema_1.Schema({ fields: [] });
    describe(index_1.SHELF_AUTO_ADD_COUNT_CHANGE, function () {
        it('changes autoAddCount', function () {
            expect(index_4.shelfReducer(__assign({}, index_2.DEFAULT_SHELF), {
                type: index_1.SHELF_AUTO_ADD_COUNT_CHANGE,
                payload: { autoAddCount: false }
            }, schema)).toEqual(__assign({}, index_2.DEFAULT_SHELF, { autoAddCount: false }));
        });
    });
    describe(index_1.SHELF_GROUP_BY_CHANGE, function () {
        it('changes autoAddCount', function () {
            expect(index_4.shelfReducer(__assign({}, index_2.DEFAULT_SHELF), {
                type: index_1.SHELF_GROUP_BY_CHANGE,
                payload: { groupBy: 'encoding' }
            }, schema)).toEqual(__assign({}, index_2.DEFAULT_SHELF, { groupBy: 'encoding' }));
        });
    });
    describe(actions_1.SHELF_LOAD_QUERY, function () {
        it('correctly loads a field suggestion query', function () {
            var query = field_suggestions_1.addCategoricalField.createQuery({ spec: { mark: '?', encodings: [] } });
            expect(index_4.shelfReducer(__assign({}, index_2.DEFAULT_SHELF), {
                type: actions_1.SHELF_LOAD_QUERY,
                payload: { query: query }
            }, schema)).toEqual(__assign({}, index_2.DEFAULT_SHELF, { spec: __assign({}, index_3.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [{
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
            }, schema)).toEqual(__assign({}, index_2.DEFAULT_SHELF, { spec: __assign({}, index_3.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                        x: { fn: { enum: ['bin', 'mean'] }, field: 'displacement', type: 'quantitative' }
                    } }) }));
        });
    });
});
//# sourceMappingURL=index.test.js.map