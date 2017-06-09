"use strict";
require("isomorphic-fetch");
var model_1 = require("compassql/build/src/model");
var recommend_1 = require("compassql/build/src/recommend");
var schema_1 = require("compassql/build/src/schema");
exports.Schema = schema_1.Schema;
var plot_1 = require("../models/plot");
function fetchCompassQLRecommend(query, schema, data, config) {
    if (config && config.serverUrl) {
        var endpoint = "recommend";
        return fetch(config.serverUrl + "/" + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                query: query,
                // fieldSchemas are just JSON
                schema: schema.fieldSchemas,
                data: data
            })
        }).then(function (response) {
            return response.json();
        }).then(function (fields) {
            return new model_1.SpecQueryGroup(fields.name, fields.path, fields.items, fields.groupBy, fields.orderGroupBy);
        });
    }
    else {
        return new Promise(function (resolve) {
            var modelGroup = recommend_1.recommend(query, schema).result;
            resolve(plot_1.convertToPlotObjectsGroup(modelGroup, data));
        });
    }
}
exports.fetchCompassQLRecommend = fetchCompassQLRecommend;
function fetchCompassQLBuildSchema(data, config) {
    if (config && config.serverUrl) {
        var endpoint = "build";
        return fetch(config.serverUrl + "/" + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                data: data
            })
        }).then(function (response) {
            return response.json();
        }).then(function (fields) {
            return new schema_1.Schema(fields);
        });
    }
    else {
        return new Promise(function (resolve) {
            resolve(schema_1.build(data));
        });
    }
}
exports.fetchCompassQLBuildSchema = fetchCompassQLBuildSchema;
