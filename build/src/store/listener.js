"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var result_1 = require("../actions/result");
var index_1 = require("../selectors/index");
function createQueryListener(store) {
    var data;
    var query;
    return function () {
        var state = store.getState();
        var previousQuery = query;
        query = index_1.selectQuery(state);
        var previousData = data;
        data = index_1.selectData(state);
        // Check if either query or data has changed, need to submit a new query.
        if (previousQuery !== query || previousData !== data) {
            // TODO: consider state of the query and make queries for related views too.
            store.dispatch(result_1.resultRequest('main', query));
        }
    };
}
exports.createQueryListener = createQueryListener;
