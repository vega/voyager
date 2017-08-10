"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var result_1 = require("../actions/result");
function dispatchQueries(store, query) {
    // TODO: consider state of the query and make queries for related views too.
    store.dispatch(result_1.resultRequest('main', query));
}
exports.dispatchQueries = dispatchQueries;
