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
var index_1 = require("../../actions/shelf/index");
var shelf_1 = require("../../models/shelf");
var index_2 = require("../../models/shelf/index");
var index_3 = require("../../models/shelf/spec/index");
var spec_1 = require("./spec");
function shelfReducer(shelf, action, schema) {
    if (shelf === void 0) { shelf = shelf_1.DEFAULT_SHELF; }
    switch (action.type) {
        case index_1.SHELF_AUTO_ADD_COUNT_CHANGE: {
            var autoAddCount = action.payload.autoAddCount;
            return __assign({}, shelf, { autoAddCount: autoAddCount });
        }
        case index_1.SHELF_GROUP_BY_CHANGE: {
            var groupBy = action.payload.groupBy;
            return __assign({}, shelf, { groupBy: groupBy });
        }
        case index_1.SHELF_LOAD_QUERY: {
            var query = action.payload.query;
            var spec_2 = index_3.fromSpecQuery(query.spec, shelf.spec.config);
            // If the groupBy is equivalent to "auto", let's set to auto for more flexibility.
            var defaultGroupBy = index_2.getDefaultGroupBy(index_3.hasWildcards(query.spec));
            var groupBy = query.groupBy === defaultGroupBy ? 'auto' : query.groupBy;
            var autoAddCount = (query.config || { autoAddCount: false }).autoAddCount;
            /* istanbul ignore else: it should reach else */
            if (index_2.isShelfGroupBy(groupBy)) {
                return __assign({}, shelf, { spec: spec_2,
                    groupBy: groupBy }, (autoAddCount ? { autoAddCount: autoAddCount } : {})
                // TODO: load other query components too, once we have them in the model
                );
            }
            else {
                throw new Error("SHELF_LOAD_QUERY does not support groupBy " + JSON.stringify(groupBy));
            }
        }
    }
    var spec = spec_1.shelfSpecReducer(shelf.spec, action, schema);
    if (spec !== shelf.spec) {
        // Make sure we only re-create a new object if something has changed.
        // TODO: once we have more query-based property here, better use some combineReducers() like function.
        // The problem is that combineReducer does not support additional parameter like `schema`
        // that we need for `shelfSpecReducer`
        return __assign({}, shelf, { spec: spec });
    }
    return shelf;
}
exports.shelfReducer = shelfReducer;
//# sourceMappingURL=index.js.map