"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("compassql/build/src/wildcard");
exports.GROUP_BY_SIMILAR_DATA_AND_TRANSFORM = ['field', 'aggregate', 'bin', 'timeUnit', 'type'];
exports.GROUP_BY_SIMILAR_ENCODINGS = exports.GROUP_BY_SIMILAR_DATA_AND_TRANSFORM.concat({
    property: 'channel',
    replace: {
        'x': 'xy', 'y': 'xy',
        'color': 'style', 'size': 'style', 'shape': 'style', 'opacity': 'style',
        'row': 'facet', 'column': 'facet'
    }
});
function makeWildcard(val) {
    return wildcard_1.isWildcard(val) ? val : wildcard_1.SHORT_WILDCARD;
}
exports.makeWildcard = makeWildcard;
