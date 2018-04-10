"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../queries/index");
var index_2 = require("../selectors/index");
function createQueryListener(store) {
    var data;
    var query;
    var relatedViews;
    return function () {
        var state = store.getState();
        var previousQuery = query;
        query = index_2.selectQuery(state);
        var previousData = data;
        data = index_2.selectData(state);
        var previousRelatedViews = relatedViews;
        relatedViews = index_2.selectRelatedViews(state);
        if (!data) {
            return;
        }
        // Check if either query or data has changed, need to submit a new query.
        if (previousQuery !== query || previousData !== data || previousRelatedViews !== relatedViews) {
            index_1.dispatchQueries(store, query);
        }
    };
}
exports.createQueryListener = createQueryListener;
//# sourceMappingURL=listener.js.map