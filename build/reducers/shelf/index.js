"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("compassql/build/src/query/spec");
var wildcard_1 = require("compassql/build/src/wildcard");
var stringify = require("json-stable-stringify");
var redux_1 = require("redux");
var index_1 = require("../../actions/shelf/index");
var spec_2 = require("../../actions/shelf/spec");
var shelf_1 = require("../../models/shelf");
var filter_1 = require("../../models/shelf/filter");
var index_2 = require("../../models/shelf/index");
var index_3 = require("../../models/shelf/spec/index");
var filter_2 = require("./filter");
var spec_3 = require("./spec");
function groupByReducer(state, action) {
    if (state === void 0) { state = shelf_1.DEFAULT_SHELF.groupBy; }
    switch (action.type) {
        case index_1.SHELF_GROUP_BY_CHANGE:
            var groupBy = action.payload.groupBy;
            return groupBy;
    }
    return state;
}
function autoAddCountReducer(state, action) {
    if (state === void 0) { state = shelf_1.DEFAULT_SHELF.autoAddCount; }
    switch (action.type) {
        case index_1.SHELF_AUTO_ADD_COUNT_CHANGE:
            var autoAddCount = action.payload.autoAddCount;
            return autoAddCount;
    }
    return state;
}
var shelfReducerBase = redux_1.combineReducers({
    spec: spec_3.shelfSpecReducer,
    autoAddCount: autoAddCountReducer,
    groupBy: groupByReducer,
    filters: filter_2.filterReducer
});
function shelfReducer(shelf, action) {
    if (shelf === void 0) { shelf = shelf_1.DEFAULT_SHELF; }
    switch (action.type) {
        case index_1.SHELF_LOAD_QUERY: {
            var query = action.payload.query;
            var spec_4 = index_3.fromSpecQuery(query.spec, shelf.spec.config);
            // If the groupBy is equivalent to "auto", let's set to auto for more flexibility.
            var defaultGroupBy = index_2.getDefaultGroupBy(index_3.hasWildcards(query.spec));
            var groupBy = query.groupBy === defaultGroupBy ? 'auto' : query.groupBy;
            var autoAddCount = (query.config || { autoAddCount: false }).autoAddCount;
            /* istanbul ignore else: it should reach else */
            if (index_2.isShelfGroupBy(groupBy)) {
                return __assign({}, shelf, { spec: spec_4,
                    groupBy: groupBy }, (autoAddCount ? { autoAddCount: autoAddCount } : {})
                // TODO: load other query components too, once we have them in the model
                );
            }
            else {
                throw new Error("SHELF_LOAD_QUERY does not support groupBy " + JSON.stringify(groupBy));
            }
        }
        case spec_2.SPEC_LOAD:
            var keepWildcardMark = action.payload.keepWildcardMark;
            var _a = action.payload.spec, transform = _a.transform, specWithoutTransform = __rest(_a, ["transform"]);
            var specQ = __assign({}, spec_1.fromSpec(specWithoutTransform), (keepWildcardMark && wildcard_1.isWildcard(shelf.spec.mark) ? {
                mark: wildcard_1.SHORT_WILDCARD
            } : {}));
            var spec = index_3.fromSpecQuery(specQ, shelf.spec.config);
            var newFilters = filter_1.fromTransforms(transform);
            var filters = stringify(newFilters) !== stringify(shelf.filters) ?
                // Use newFilters only if it is different
                newFilters : shelf.filters;
            return __assign({}, shelf_1.DEFAULT_SHELF, { spec: spec, filters: filters });
    }
    return shelfReducerBase(shelf, action);
}
exports.shelfReducer = shelfReducer;
//# sourceMappingURL=index.js.map