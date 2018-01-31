"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("compassql/build/src/wildcard");
function makeWildcard(val) {
    return wildcard_1.isWildcard(val) ? val : wildcard_1.SHORT_WILDCARD;
}
exports.makeWildcard = makeWildcard;
//# sourceMappingURL=common.js.map