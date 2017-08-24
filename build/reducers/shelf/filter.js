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
var spec_1 = require("../../models/shelf/spec");
var util_1 = require("../util");
function filterReducer(shelfSpec, action, schema) {
    if (shelfSpec === void 0) { shelfSpec = spec_1.DEFAULT_SHELF_UNIT_SPEC; }
    switch (action.type) {
        case actions_1.FILTER_ADD: {
            var filter = action.payload.filter;
            var index = action.payload.index;
            if (!index) {
                index = shelfSpec.filters.length;
            }
            var filters = util_1.insertItemToArray(shelfSpec.filters, index, filter);
            return __assign({}, shelfSpec, { filters: filters });
        }
        case actions_1.FILTER_CLEAR: {
            var filters = [];
            return __assign({}, shelfSpec, { filters: filters });
        }
        case actions_1.FILTER_REMOVE: {
            var index = action.payload.index;
            var filters = util_1.removeItemFromArray(shelfSpec.filters, index).array;
            return __assign({}, shelfSpec, { filters: filters });
        }
        case actions_1.FILTER_MODIFY_EXTENT: {
            var _a = action.payload, index = _a.index, range_1 = _a.range;
            var modifyExtent = function (filter) {
                return __assign({}, filter, { range: range_1 });
            };
            return __assign({}, shelfSpec, { filters: util_1.modifyItemInArray(shelfSpec.filters, index, modifyExtent) });
        }
        case actions_1.FILTER_MODIFY_MAX_BOUND: {
            var _b = action.payload, index = _b.index, maxBound_1 = _b.maxBound;
            var modifyMaxBound = function (filter) {
                return __assign({}, filter, { range: [filter.range[0], maxBound_1] });
            };
            return __assign({}, shelfSpec, { filters: util_1.modifyItemInArray(shelfSpec.filters, index, modifyMaxBound) });
        }
        case actions_1.FILTER_MODIFY_MIN_BOUND: {
            var _c = action.payload, index = _c.index, minBound_1 = _c.minBound;
            var modifyMinBound = function (filter) {
                return __assign({}, filter, { range: [minBound_1, filter.range[1]] });
            };
            return __assign({}, shelfSpec, { filters: util_1.modifyItemInArray(shelfSpec.filters, index, modifyMinBound) });
        }
        case actions_1.FILTER_MODIFY_ONE_OF: {
            var _d = action.payload, index = _d.index, oneOf_1 = _d.oneOf;
            var modifyOneOf = function (filter) {
                return __assign({}, filter, { oneOf: oneOf_1 });
            };
            return __assign({}, shelfSpec, { filters: util_1.modifyItemInArray(shelfSpec.filters, index, modifyOneOf) });
        }
        case actions_1.FILTER_MODIFY_TIME_UNIT: {
            var _e = action.payload, index = _e.index, timeUnit_1 = _e.timeUnit;
            var domain_1 = schema.domain({ field: shelfSpec.filters[index].field });
            var modifyTimeUnit = void 0;
            if (!timeUnit_1) {
                modifyTimeUnit = function (filter) {
                    return {
                        field: filter.field,
                        timeUnit: timeUnit_1,
                        range: [filter_1.convertToDateTimeObject(domain_1[0]), filter_1.convertToDateTimeObject(domain_1[1])]
                    };
                };
            }
            else if (timeUnit_1 === timeunit_1.TimeUnit.MONTH || timeUnit_1 === timeunit_1.TimeUnit.DAY) {
                modifyTimeUnit = function (filter) {
                    return {
                        field: filter.field,
                        timeUnit: timeUnit_1,
                        oneOf: filter_1.getDefaultList(timeUnit_1)
                    };
                };
            }
            else {
                modifyTimeUnit = function (filter) {
                    return {
                        field: filter.field,
                        timeUnit: timeUnit_1,
                        range: filter_1.getDefaultRange(domain_1, timeUnit_1)
                    };
                };
            }
            return __assign({}, shelfSpec, { filters: util_1.modifyItemInArray(shelfSpec.filters, index, modifyTimeUnit) });
        }
        default: {
            return shelfSpec;
        }
    }
}
exports.filterReducer = filterReducer;
//# sourceMappingURL=filter.js.map