"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("compassql/build/src/schema");
var schema_2 = require("compassql/build/src/schema");
exports.Schema = schema_2.Schema;
exports.DEFAULT_DATASET = {
    isLoading: false,
    name: 'Empty',
    schema: new schema_1.Schema({ fields: [] }),
    data: null
};
//# sourceMappingURL=dataset.js.map