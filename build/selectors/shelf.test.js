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
var index_1 = require("../models/index");
var index_2 = require("../models/shelf/index");
var spec_1 = require("../models/shelf/spec");
var index_3 = require("../models/shelf/spec/index");
var shelf_1 = require("./shelf");
describe('selectors/shelf', function () {
    describe('selectFilters', function () {
        it('selecting filters should returns an array of filters', function () {
            var filters = [{ field: 'q1', range: [0, 1] }];
            var state = {
                persistent: index_1.DEFAULT_PERSISTENT_STATE,
                undoable: __assign({}, index_1.DEFAULT_STATE.undoable, { present: __assign({}, index_1.DEFAULT_UNDOABLE_STATE_BASE, { dataset: {
                            data: {
                                values: []
                            },
                            isLoading: false,
                            name: 'Test',
                            schema: new schema_1.Schema({
                                fields: []
                            }),
                        }, shelf: __assign({}, index_2.DEFAULT_SHELF, { filters: filters }) }) })
            };
            expect(shelf_1.selectFilters(state)).toBe(filters);
        });
    });
    describe('selectShelfGroupBy', function () {
        it('selecting shelf should return the default shelf', function () {
            expect(shelf_1.selectShelfGroupBy(index_1.DEFAULT_STATE)).toBe(index_1.DEFAULT_STATE.undoable.present.shelf.groupBy);
        });
    });
    describe('selectQuery', function () {
        it('selecting query should return the query constructed with default shelf', function () {
            expect(shelf_1.selectQuery(index_1.DEFAULT_STATE)).toEqual(index_2.toQuery(index_1.DEFAULT_STATE.undoable.present.shelf));
        });
    });
    describe('selectQuerySpec', function () {
        it('selecting query spec should return the default query spec', function () {
            expect(shelf_1.selectQuerySpec(index_1.DEFAULT_STATE)).toEqual(index_2.toQuery(index_1.DEFAULT_STATE.undoable.present.shelf).spec);
        });
    });
    describe('selectIsQuerySpecific', function () {
        it('selecting isQuerySpecific should return whether the default query is specific', function () {
            var specQ = index_3.toSpecQuery(index_1.DEFAULT_STATE.undoable.present.shelf.spec);
            expect(shelf_1.selectIsQuerySpecific(index_1.DEFAULT_STATE)).toEqual(!spec_1.hasWildcards(specQ).hasAnyWildcard);
        });
    });
});
//# sourceMappingURL=shelf.test.js.map