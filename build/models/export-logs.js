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
var data_1 = require("vega-lite/build/src/data");
var dataset_1 = require("../actions/dataset");
function constructLogString(inputLogs) {
    var outputLogs = [];
    for (var _i = 0, inputLogs_1 = inputLogs; _i < inputLogs_1.length; _i++) {
        var inputLog = inputLogs_1[_i];
        var type = inputLog.action.type;
        var payload = inputLog.action.payload;
        if (type === dataset_1.DATASET_RECEIVE && data_1.isInlineData(payload.data)) {
            // don't output inline data because it might make the log file too big
            payload = __assign({}, payload, { data: { name: 'source' } });
        }
        outputLogs.push({
            timestamp: inputLog.timestamp,
            ISOString: new Date(inputLog.timestamp).toISOString(),
            type: type,
            payload: JSON.stringify(payload)
        });
    }
    return outputLogs;
}
exports.constructLogString = constructLogString;
;
//# sourceMappingURL=export-logs.js.map