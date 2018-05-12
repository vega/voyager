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
var index_1 = require("../actions/index");
var reset_1 = require("../actions/reset");
var bookmark_1 = require("../models/bookmark");
var custom_wildcard_field_1 = require("../models/custom-wildcard-field");
var dataset_1 = require("../models/dataset");
var index_2 = require("../models/index");
var related_views_1 = require("../models/related-views");
var result_1 = require("../models/result");
var index_3 = require("../models/shelf/index");
var dataset_2 = require("../selectors/dataset");
var index_4 = require("../selectors/index");
var result_2 = require("../selectors/result");
var shelf_1 = require("../selectors/shelf");
var index_5 = require("./index");
describe('reducers/index', function () {
    describe("Action Groups", function () {
        it('All actions should be in a group', function () {
            var actionsInIndex = [].concat(index_5.ACTIONS_EXCLUDED_FROM_HISTORY, index_5.GROUPED_ACTIONS, index_5.USER_ACTIONS);
            for (var _i = 0, ACTION_TYPES_1 = index_1.ACTION_TYPES; _i < ACTION_TYPES_1.length; _i++) {
                var action = ACTION_TYPES_1[_i];
                expect(actionsInIndex).toContain(action);
            }
        });
    });
    describe('RESET', function () {
        it('should reset bookmark, dataset, shelf, result, customWildcardFields, tab', function () {
            var oldState = __assign({}, index_2.DEFAULT_STATE, { persistent: __assign({}, index_2.DEFAULT_PERSISTENT_STATE, { bookmark: { count: 1, list: [] } }), undoable: __assign({}, index_2.DEFAULT_UNDOABLE_STATE, { present: __assign({}, index_2.DEFAULT_UNDOABLE_STATE_BASE, { dataset: {
                            isLoading: false,
                            name: 'Mock',
                            schema: null,
                            data: null
                        }, customWildcardFields: [{ fields: ['test'] }], tab: {
                            activeTabID: 1,
                            list: [
                                index_2.DEFAULT_PLOT_TAB_STATE,
                                __assign({}, index_2.DEFAULT_PLOT_TAB_STATE, { shelf: __assign({}, index_3.DEFAULT_SHELF, { spec: __assign({ mark: 'point' }, index_3.DEFAULT_SHELF_UNIT_SPEC) }), result: __assign({}, result_1.DEFAULT_RESULT_INDEX, { main: {
                                            isLoading: false,
                                            plots: [],
                                            query: null,
                                            limit: 20
                                        } }) })
                            ]
                        } }) }) });
            var state = index_5.rootReducer(oldState, { type: reset_1.RESET });
            expect(index_4.selectBookmark(state)).toEqual(bookmark_1.DEFAULT_BOOKMARK);
            expect(index_4.selectCustomWildcardFields(state)).toEqual(custom_wildcard_field_1.DEFAULT_CUSTOM_WILDCARD_FIELDS);
            expect(dataset_2.selectDataset(state)).toEqual(dataset_1.DEFAULT_DATASET);
            expect(index_4.selectRelatedViews(state)).toEqual(related_views_1.DEFAULT_RELATED_VIEWS);
            expect(shelf_1.selectShelf(state)).toEqual(index_3.DEFAULT_SHELF);
            expect(shelf_1.selectShelfAutoAddCount(state)).toEqual(true);
            expect(result_2.selectResult.main(state)).toEqual(result_1.DEFAULT_RESULT);
            expect(index_4.selectTab(state)).toEqual(index_2.DEFAULT_TAB);
        });
    });
});
//# sourceMappingURL=index.test.js.map