"use strict";
var api_1 = require("../api/api");
var selectors_1 = require("../selectors");
exports.RESULT_REQUEST = 'RESULT_REQUEST';
exports.RESULT_RECEIVE = 'RESULT_RECEIVE';
function resultRequest() {
    return function (dispatch, getState) {
        var query = selectors_1.getQuery(getState());
        var schema = selectors_1.getSchema(getState());
        var data = selectors_1.getData(getState());
        dispatch({
            type: exports.RESULT_REQUEST
        });
        // TODO: pass in config
        return api_1.fetchCompassQLRecommend(query, schema, data).then(function (modelGroup) {
            dispatch({
                type: exports.RESULT_RECEIVE,
                payload: { modelGroup: modelGroup }
            });
        });
    };
}
exports.resultRequest = resultRequest;
