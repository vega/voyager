"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fetch = require("isomorphic-fetch");
var redux_undo_1 = require("redux-undo");
var data_1 = require("vega-lite/build/src/data");
var api_1 = require("../api/api");
var shelf_1 = require("./shelf");
var selectors_1 = require("../selectors");
exports.DATASET_SCHEMA_CHANGE_FIELD_TYPE = 'DATASET_SCHEMA_CHANGE_FIELD_TYPE';
exports.DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN = 'DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN';
exports.DATASET_URL_REQUEST = 'DATASET_URL_REQUEST';
exports.DATASET_URL_RECEIVE = 'DATASET_URL_RECEIVE';
exports.DATASET_INLINE_RECEIVE = 'DATASET_INLINE_RECEIVE';
function datasetLoad(name, dataset) {
    return function (dispatch, getState) {
        var config = selectors_1.getConfig(getState());
        // Get the new dataset
        if (data_1.isUrlData(dataset)) {
            var url_1 = dataset.url;
            dispatch({
                type: exports.DATASET_URL_REQUEST,
                payload: { name: name, url: url_1 }
            });
            return fetch(url_1)
                .then(function (response) { return response.json(); }) // TODO: handle error
                .then(function (data) { return api_1.fetchCompassQLBuildSchema(data, config); }) // TODO: handle error
                .then(function (schema) {
                dispatch({
                    type: exports.DATASET_URL_RECEIVE,
                    payload: { name: name, url: url_1, schema: schema }
                });
                // Clear history and shelf
                dispatch({ type: shelf_1.SHELF_CLEAR });
                dispatch(redux_undo_1.ActionCreators.clearHistory());
            });
        }
        else if (data_1.isInlineData(dataset)) {
            return api_1.fetchCompassQLBuildSchema(dataset.values, config) // TODO: handle error
                .then(function (schema) {
                var data = dataset;
                dispatch({
                    type: exports.DATASET_INLINE_RECEIVE,
                    payload: { name: name, schema: schema, data: data }
                });
                // Clear history and shelf
                dispatch({ type: shelf_1.SHELF_CLEAR });
                dispatch(redux_undo_1.ActionCreators.clearHistory());
            });
        }
        else {
            throw new Error('dataset load error: dataset type not detected');
        }
    };
}
exports.datasetLoad = datasetLoad;
;
