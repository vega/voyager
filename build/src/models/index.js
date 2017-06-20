"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var dataset_1 = require("./dataset");
var result_1 = require("./result");
var shelf_1 = require("./shelf");
__export(require("./dataset"));
__export(require("./shelf"));
__export(require("./result"));
exports.DEFAULT_STATE = {
    config: config_1.DEFAULT_VOYAGER_CONFIG,
    dataset: dataset_1.DEFAULT_DATASET,
    shelf: shelf_1.DEFAULT_SHELF_SPEC,
    result: result_1.DEFAULT_RESULT,
};
