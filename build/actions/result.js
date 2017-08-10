"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../api/api");
var selectors_1 = require("../selectors");
exports.RESULT_REQUEST = 'RESULT_REQUEST';
exports.RESULT_RECEIVE = 'RESULT_RECEIVE';
function resultRequest(resultType, query) {
    return function (dispatch, getState) {
        var schema = selectors_1.selectSchema(getState());
        var data = selectors_1.selectData(getState());
        var config = selectors_1.selectConfig(getState());
        dispatch({
            type: exports.RESULT_REQUEST,
            payload: { resultType: resultType }
        });
        // TODO: pass in config
        return api_1.fetchCompassQLRecommend(query, schema, data, config).then(function (modelGroup) {
            dispatch({
                type: exports.RESULT_RECEIVE,
                payload: { query: query, modelGroup: modelGroup, resultType: resultType }
            });
        });
    };
}
exports.resultRequest = resultRequest;
