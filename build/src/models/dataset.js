"use strict";
var schema_1 = require("compassql/build/src/schema");
var schema_2 = require("compassql/build/src/schema");
exports.Schema = schema_2.Schema;
// FIXME: replace this with real data
exports.DEFAULT_DATASET = {
    isLoading: false,
    name: 'Sample',
    schema: new schema_1.Schema([{
            field: 'q1',
            type: 'quantitative',
            primitiveType: 'number',
            stats: {
                distinct: 2
            }
        }, {
            field: 'q2',
            type: 'quantitative',
            primitiveType: 'number',
            stats: {
                distinct: 2
            }
        }, {
            field: 't',
            type: 'temporal',
            primitiveType: 'date',
            stats: {
                distinct: 2
            }
        }, {
            field: 'n1',
            type: 'nominal',
            primitiveType: 'string',
            stats: {
                distinct: 2
            }
        }, {
            field: 'n2',
            type: 'nominal',
            primitiveType: 'string',
            stats: {
                distinct: 2
            }
        }]),
    data: {
        values: [
            { q1: 1, q2: 2, t: new Date(), n1: 'a', n2: 1 },
            { q1: 100, q2: 23, t: new Date(), n1: 'c', n2: 1 }
        ]
    }
};
