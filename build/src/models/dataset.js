"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("compassql/build/src/schema");
var schema_2 = require("compassql/build/src/schema");
exports.Schema = schema_2.Schema;
// FIXME: replace this with real data
exports.DEFAULT_DATASET = {
    isLoading: false,
    name: 'Sample',
    schema: new schema_1.Schema({ fields: [{
                name: 'q1',
                vlType: 'quantitative',
                type: 'number',
                stats: {
                    distinct: 2
                }
            }, {
                name: 'q2',
                vlType: 'quantitative',
                type: 'number',
                stats: {
                    distinct: 2
                }
            }, {
                name: 't',
                vlType: 'temporal',
                type: 'date',
                stats: {
                    distinct: 2
                }
            }, {
                name: 'n1',
                vlType: 'nominal',
                type: 'string',
                stats: {
                    distinct: 2
                }
            }, {
                name: 'n2',
                vlType: 'nominal',
                type: 'string',
                stats: {
                    distinct: 2
                }
            }] }),
    data: {
        values: [
            { q1: 1, q2: 2, t: new Date(), n1: 'a', n2: 1 },
            { q1: 100, q2: 23, t: new Date(), n1: 'c', n2: 1 }
        ]
    }
};
