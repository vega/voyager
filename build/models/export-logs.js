"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function constructLogString(inputLogs) {
    var outputLogs = [];
    for (var _i = 0, inputLogs_1 = inputLogs; _i < inputLogs_1.length; _i++) {
        var inputLog = inputLogs_1[_i];
        outputLogs.push({
            timestamp: inputLog.timestamp,
            ISOString: new Date(inputLog.timestamp).toISOString(),
            type: inputLog.action.type,
            payload: JSON.stringify(inputLog.action.payload)
        });
    }
    return outputLogs;
}
exports.constructLogString = constructLogString;
;
