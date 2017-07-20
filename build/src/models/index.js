"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("compassql/build/src/schema");
var util_1 = require("vega-lite/build/src/util");
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
function toSerializable(state) {
    var asSerializable = {
        config: state.config,
        shelf: state.shelf,
        result: state.result,
        dataset: {
            isLoading: state.dataset.isLoading,
            name: state.dataset.name,
            data: state.dataset.data,
        },
        tableschema: state.dataset.schema.tableSchema(),
    };
    return asSerializable;
}
exports.toSerializable = toSerializable;
function fromSerializable(serializable) {
    // We make a clone of this object to not modify the input param.
    var deserialized = util_1.duplicate(serializable);
    // Add a schema object with a hydrated version of the table schema
    deserialized.dataset.schema = new schema_1.Schema(deserialized.tableschema);
    delete deserialized.dataset.tableschema;
    return deserialized;
}
exports.fromSerializable = fromSerializable;
