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
var bookmark_1 = require("../models/bookmark");
var config_1 = require("../models/config");
var index_1 = require("../models/index");
var result_1 = require("../models/result");
var shelf_preview_1 = require("../models/shelf-preview");
var index_2 = require("../models/shelf/index");
var spec_1 = require("../models/shelf/spec");
var shelf_1 = require("./shelf");
describe('selectors/shelf', function () {
    describe('selectFilters', function () {
        it('selecting filters should returns an array of filters', function () {
            var filters = [{ field: 'q1', range: [0, 1] }];
            var state = {
                persistent: {
                    bookmark: __assign({}, bookmark_1.DEFAULT_BOOKMARK),
                    shelfPreview: __assign({}, shelf_preview_1.DEFAULT_SHELF_PREVIEW)
                },
                undoable: __assign({}, index_1.DEFAULT_STATE.undoable, { present: {
                        config: __assign({}, config_1.DEFAULT_VOYAGER_CONFIG),
                        dataset: {
                            data: {
                                values: []
                            },
                            isLoading: false,
                            name: 'Test',
                            schema: new schema_1.Schema({
                                fields: []
                            }),
                        },
                        shelf: {
                            spec: __assign({}, spec_1.DEFAULT_SHELF_UNIT_SPEC)
                        },
                        result: __assign({}, result_1.DEFAULT_RESULT_INDEX)
                    } })
            };
            state.undoable.present.shelf.spec.filters = filters;
            expect(shelf_1.selectFilters(state)).toBe(filters);
        });
    });
    describe('selectShelf', function () {
        it('selecting shelf should return the default shelf', function () {
            expect(shelf_1.selectShelf(index_1.DEFAULT_STATE)).toBe(index_1.DEFAULT_STATE.undoable.present.shelf);
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
            expect(shelf_1.selectIsQuerySpecific(index_1.DEFAULT_STATE)).toEqual(!spec_1.hasWildcards(index_2.toQuery(index_1.DEFAULT_STATE.undoable.present.shelf).spec).hasAnyWildcard);
        });
    });
});
