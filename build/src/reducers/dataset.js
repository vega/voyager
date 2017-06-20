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
var actions_1 = require("../actions");
var models_1 = require("../models");
function datasetReducer(dataset, action) {
    if (dataset === void 0) { dataset = models_1.DEFAULT_DATASET; }
    switch (action.type) {
        case actions_1.DATASET_URL_REQUEST:
            return __assign({}, dataset, { isLoading: true });
        case actions_1.DATASET_URL_RECEIVE:
            {
                var _a = action.payload, name_1 = _a.name, url = _a.url, schema = _a.schema;
                return __assign({}, dataset, { isLoading: false, name: name_1,
                    schema: schema, data: { url: url } });
            }
        case actions_1.DATASET_INLINE_RECEIVE:
            {
                var _b = action.payload, name_2 = _b.name, data = _b.data, schema = _b.schema;
                return __assign({}, dataset, { isLoading: false, name: name_2,
                    schema: schema,
                    data: data });
            }
    }
    return dataset;
}
exports.datasetReducer = datasetReducer;
