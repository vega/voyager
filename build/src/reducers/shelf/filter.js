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
var filter_1 = require("../../actions/filter");
var spec_1 = require("../../models/shelf/spec");
var util_1 = require("../util");
function filterReducer(shelfSpec, action) {
    if (shelfSpec === void 0) { shelfSpec = spec_1.DEFAULT_SHELF_UNIT_SPEC; }
    switch (action.type) {
        case filter_1.FILTER_ADD: {
            var _a = action.payload, filter = _a.filter, index = _a.index;
            var filters = util_1.insertItemToArray(shelfSpec.filters, index, filter);
            return __assign({}, shelfSpec, { filters: filters });
        }
        case filter_1.FILTER_REMOVE: {
            var index = action.payload.index;
            var filters = util_1.removeItemFromArray(shelfSpec.filters, index).array;
            return __assign({}, shelfSpec, { filters: filters });
        }
        case filter_1.FILTER_MODIFY_MAX_BOUND: {
            var _b = action.payload, index = _b.index, maxBound_1 = _b.maxBound;
            var modifier = function (filter) {
                return __assign({}, filter, { range: [filter.range[0], maxBound_1] });
            };
            var filters = util_1.modifyItemInArray(shelfSpec.filters, index, modifier);
            return __assign({}, shelfSpec, { filters: filters });
        }
        case filter_1.FILTER_MODIFY_MIN_BOUND: {
            var _c = action.payload, index = _c.index, minBound_1 = _c.minBound;
            var modifier = function (filter) {
                return __assign({}, filter, { range: [minBound_1, filter.range[filter.range.length - 1]] });
            };
            var filters = util_1.modifyItemInArray(shelfSpec.filters, index, modifier);
            return __assign({}, shelfSpec, { filters: filters });
        }
        case filter_1.FILTER_MODIFY_ONE_OF: {
            var _d = action.payload, index = _d.index, oneOf_1 = _d.oneOf;
            var modifier = function (filter) {
                return __assign({}, filter, { oneOf: oneOf_1 });
            };
            var filters = util_1.modifyItemInArray(shelfSpec.filters, index, modifier);
            return __assign({}, shelfSpec, { filters: filters });
        }
        default: {
            return shelfSpec;
        }
    }
}
exports.filterReducer = filterReducer;
