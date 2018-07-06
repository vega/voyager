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
var vega_util_1 = require("vega-util");
var bookmark_1 = require("../models/bookmark");
var config_1 = require("../models/config");
var custom_wildcard_field_1 = require("../models/custom-wildcard-field");
var dataset_1 = require("../models/dataset");
var index_1 = require("../models/index");
var log_1 = require("../models/log");
var shelf_preview_1 = require("../models/shelf-preview");
var index_2 = require("../models/shelf/index");
var index_3 = require("./index");
describe('selectors/index', function () {
    describe('selectBookmark', function () {
        it('selecting bookmark returns default bookmark', function () {
            expect(index_3.selectBookmark(index_1.DEFAULT_STATE)).toBe(bookmark_1.DEFAULT_BOOKMARK);
        });
    });
    describe('selectConfig', function () {
        it('selecting config should returns default voyager config', function () {
            expect(index_3.selectConfig(index_1.DEFAULT_STATE)).toBe(config_1.DEFAULT_VOYAGER_CONFIG);
        });
    });
    describe('selectShelfPreview', function () {
        it('selecting shelf preview should return default shelf preview', function () {
            expect(index_3.selectShelfPreview(index_1.DEFAULT_STATE)).toBe(shelf_preview_1.DEFAULT_SHELF_PREVIEW);
        });
    });
    describe('selectLog', function () {
        it('selecting log from the default state should return the default log', function () {
            expect(index_3.selectLog(index_1.DEFAULT_STATE)).toBe(log_1.DEFAULT_LOG);
        });
    });
    describe('selectFilteredData', function () {
        it('returns filtered data', function () {
            var state = __assign({}, index_1.DEFAULT_STATE, { undoable: __assign({}, index_1.DEFAULT_STATE.undoable, { present: __assign({}, index_1.DEFAULT_STATE.undoable.present, { dataset: __assign({}, dataset_1.DEFAULT_DATASET, { data: {
                                values: [{ a: 1 }, { a: 3 }]
                            } }), customWildcardFields: custom_wildcard_field_1.DEFAULT_CUSTOM_WILDCARD_FIELDS, tab: {
                            activeTabID: index_1.DEFAULT_ACTIVE_TAB_ID,
                            list: [__assign({}, index_1.DEFAULT_PLOT_TAB_STATE, { shelf: __assign({}, index_2.DEFAULT_SHELF, { filters: [{ field: 'a', oneOf: [3] }] }) })]
                        } }) }) });
            var filteredData = index_3.selectFilteredData(state);
            if (vega_util_1.isArray(filteredData.values)) {
                expect(filteredData.values.length).toEqual(1);
            }
            expect(filteredData.values[0].a).toEqual(3);
        });
    });
    describe('selectFilteredData', function () {
        it('returns original data if there is no filter.', function () {
            var data = { values: [{ a: 1 }, { a: 3 }] };
            var state = __assign({}, index_1.DEFAULT_STATE, { undoable: __assign({}, index_1.DEFAULT_STATE.undoable, { present: __assign({}, index_1.DEFAULT_STATE.undoable.present, { dataset: __assign({}, dataset_1.DEFAULT_DATASET, { data: data }) }) }) });
            expect(index_3.selectFilteredData(state)).toBe(data);
        });
    });
    describe('selectFilteredData', function () {
        it('returns null data if there is no data.', function () {
            expect(index_3.selectFilteredData(index_1.DEFAULT_STATE)).toBe(dataset_1.DEFAULT_DATASET.data);
        });
    });
});
//# sourceMappingURL=index.test.js.map