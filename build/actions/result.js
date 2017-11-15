"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../api/api");
var selectors_1 = require("../selectors");
var RESULT_ACTION_TYPE_INDEX = {
    RESULT_REQUEST: 1,
    RESULT_RECEIVE: 1,
    RESULT_LIMIT_INCREASE: 1,
    // Result modify actions
    RESULT_MODIFY_FIELD_PROP: 1,
    RESULT_MODIFY_NESTED_FIELD_PROP: 1
};
function isResultAction(action) {
    return RESULT_ACTION_TYPE_INDEX[action.type];
}
exports.isResultAction = isResultAction;
exports.RESULT_REQUEST = 'RESULT_REQUEST';
exports.RESULT_LIMIT_INCREASE = 'RESULT_LIMIT_INCREASE';
exports.RESULT_RECEIVE = 'RESULT_RECEIVE';
exports.RESULT_MODIFY_FIELD_PROP = 'RESULT_MODIFY_FIELD_PROP';
exports.RESULT_MODIFY_NESTED_FIELD_PROP = 'RESULT_MODIFY_NESTED_FIELD_PROP';
function resultRequest(resultType, query, filterKey) {
    return function (dispatch, getState) {
        var schema = selectors_1.selectSchema(getState());
        var data = selectors_1.selectData(getState());
        var config = selectors_1.selectConfig(getState());
        dispatch({
            type: exports.RESULT_REQUEST,
            payload: { resultType: resultType }
        });
        // TODO: pass in config
        return api_1.fetchCompassQLRecommend(query, schema, data, config).then(function (preFilteredPlots) {
            var plots = (filterKey ?
                preFilteredPlots.filter(function (p) { return p.groupByKey !== filterKey; }) :
                preFilteredPlots).map(function (p) { return p.plot; });
            dispatch({
                type: exports.RESULT_RECEIVE,
                payload: { query: query, plots: plots, resultType: resultType }
            });
        });
    };
}
exports.resultRequest = resultRequest;
//# sourceMappingURL=result.js.map