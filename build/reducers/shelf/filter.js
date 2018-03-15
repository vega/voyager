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
var timeunit_1 = require("vega-lite/build/src/timeunit");
var actions_1 = require("../../actions");
var filter_1 = require("../../models/shelf/filter");
var util_1 = require("../util");
function filterReducer(filters, action) {
    if (filters === void 0) { filters = []; }
    switch (action.type) {
        case actions_1.FILTER_ADD: {
            var filter = action.payload.filter;
            var index = action.payload.index;
            if (!index) {
                index = filters.length;
            }
            return util_1.insertItemToArray(filters, index, filter);
        }
        case actions_1.FILTER_CLEAR: {
            return [];
        }
        case actions_1.FILTER_REMOVE: {
            var index = action.payload.index;
            return util_1.removeItemFromArray(filters, index).array;
        }
        case actions_1.FILTER_TOGGLE: {
            var filter = action.payload.filter;
            var index = filter_1.filterIndexOf(filters, filter.field);
            if (index === -1) {
                // add filter
                return util_1.insertItemToArray(filters, filters.length, filter);
            }
            else {
                return util_1.removeItemFromArray(filters, index).array;
            }
        }
        case actions_1.FILTER_MODIFY_EXTENT: {
            var _a = action.payload, index = _a.index, range_1 = _a.range;
            var modifyExtent = function (filter) {
                return __assign({}, filter, { range: range_1 });
            };
            return util_1.modifyItemInArray(filters, index, modifyExtent);
        }
        case actions_1.FILTER_MODIFY_MAX_BOUND: {
            var _b = action.payload, index = _b.index, maxBound_1 = _b.maxBound;
            var modifyMaxBound = function (filter) {
                return __assign({}, filter, { range: [filter.range[0], maxBound_1] });
            };
            return util_1.modifyItemInArray(filters, index, modifyMaxBound);
        }
        case actions_1.FILTER_MODIFY_MIN_BOUND: {
            var _c = action.payload, index = _c.index, minBound_1 = _c.minBound;
            var modifyMinBound = function (filter) {
                return __assign({}, filter, { range: [minBound_1, filter.range[1]] });
            };
            return util_1.modifyItemInArray(filters, index, modifyMinBound);
        }
        case actions_1.FILTER_MODIFY_ONE_OF: {
            var _d = action.payload, index = _d.index, oneOf_1 = _d.oneOf;
            var modifyOneOf = function (filter) {
                return __assign({}, filter, { oneOf: oneOf_1 });
            };
            return util_1.modifyItemInArray(filters, index, modifyOneOf);
        }
        case actions_1.FILTER_MODIFY_TIME_UNIT: {
            var _e = action.payload, index = _e.index, timeUnit = _e.timeUnit, domain = _e.domain;
            return util_1.modifyItemInArray(filters, index, getModifyTimeUnitFunction(timeUnit, domain));
        }
        default: {
            return filters;
        }
    }
}
exports.filterReducer = filterReducer;
function getModifyTimeUnitFunction(timeUnit, domain) {
    if (timeUnit === timeunit_1.TimeUnit.MONTH || timeUnit === timeunit_1.TimeUnit.DAY) {
        return function (filter) {
            return {
                field: filter.field,
                timeUnit: timeUnit,
                oneOf: filter_1.getDefaultList(timeUnit)
            };
        };
    }
    else {
        return function (filter) {
            return __assign({ field: filter.field }, timeUnit ? { timeUnit: timeUnit } : {}, { range: filter_1.getDefaultTimeRange(domain, timeUnit) });
        };
    }
}
//# sourceMappingURL=filter.js.map