"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mark_1 = require("vega-lite/build/src/mark");
var type_1 = require("vega-lite/build/src/type");
var actions_1 = require("../actions");
var bookmark_1 = require("./bookmark");
describe('reducers/bookmark', function () {
    var data = { url: 'a/data/set.csv' };
    var plotObject = {
        fieldInfos: [],
        spec: {
            data: data,
            mark: mark_1.Mark.POINT,
            encoding: {
                x: { field: 'A', type: type_1.Type.QUANTITATIVE }
            }
        }
    };
    var specKey = JSON.stringify(plotObject.spec);
    describe(actions_1.BOOKMARK_ADD_PLOT, function () {
        it('should add a plot to the bookmark list', function () {
            var expectedBookmarkItem = { plotObject: plotObject, note: '' };
            var expectedDict = {};
            expectedDict[specKey] = expectedBookmarkItem;
            expect(bookmark_1.bookmarkReducer({
                dict: {},
                count: 0,
                list: []
            }, {
                type: actions_1.BOOKMARK_ADD_PLOT,
                payload: {
                    plotObject: plotObject
                }
            })).toEqual({
                dict: expectedDict,
                count: 1,
                list: [specKey]
            });
        });
    });
    describe(actions_1.BOOKMARK_MODIFY_NOTE, function () {
        it('should modify notes for a bookmarked plot', function () {
            var bookmarkItem = { plotObject: plotObject, note: '' };
            var expectedBookmarkItem = { plotObject: plotObject, note: 'This is very interesting.' };
            var expectedDict = {};
            expectedDict[specKey] = expectedBookmarkItem;
            expect(bookmark_1.bookmarkReducer({
                dict: (_a = {},
                    _a[specKey] = bookmarkItem,
                    _a),
                count: 1,
                list: [specKey]
            }, {
                type: actions_1.BOOKMARK_MODIFY_NOTE,
                payload: {
                    note: 'This is very interesting.',
                    spec: plotObject.spec
                }
            })).toEqual({
                dict: expectedDict,
                count: 1,
                list: [specKey]
            });
            var _a;
        });
    });
    describe(actions_1.BOOKMARK_REMOVE_PLOT, function () {
        it('should remove a bookmark from the bookmark list', function () {
            var bookmarkItem = { plotObject: plotObject, note: '' };
            expect(bookmark_1.bookmarkReducer({
                dict: (_a = {},
                    _a[specKey] = bookmarkItem,
                    _a),
                count: 1,
                list: [specKey]
            }, {
                type: actions_1.BOOKMARK_REMOVE_PLOT,
                payload: {
                    spec: plotObject.spec
                }
            })).toEqual({
                dict: {},
                count: 0,
                list: []
            });
            var _a;
        });
    });
});
