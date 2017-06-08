"use strict";
var redux_undo_1 = require("redux-undo");
var actions_1 = require("../actions");
var constants_1 = require("../constants");
var config_1 = require("./config");
var dataset_1 = require("./dataset");
var result_1 = require("./result");
var shelf_1 = require("./shelf");
function reducer(state, action) {
    return {
        config: config_1.configReducer(state.config, action),
        dataset: dataset_1.datasetReducer(state.dataset, action),
        shelf: shelf_1.shelfReducer(state.shelf, action, state.dataset.schema),
        result: result_1.resultReducer(state.result, action)
    };
}
exports.rootReducer = redux_undo_1.default(reducer, {
    limit: constants_1.HISTORY_LIMIT,
    undoType: actions_1.UNDO,
    redoType: actions_1.REDO
});
