"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var wildcard_1 = require("compassql/build/src/wildcard");
;
;
function isWildcardChannelId(shelfId) {
    return wildcard_1.isWildcard(shelfId.channel);
}
exports.isWildcardChannelId = isWildcardChannelId;
function fromEncodingQueries(encodings) {
    return encodings.reduce(function (encodingMixins, encQ) {
        if (wildcard_1.isWildcard(encQ.channel)) {
            encodingMixins.anyEncodings.push(encQ);
        }
        else {
            var _ = encQ.channel, fieldDef = __rest(encQ, ["channel"]);
            encodingMixins.encoding[encQ.channel] = fieldDef;
        }
        return encodingMixins;
    }, { encoding: {}, anyEncodings: [] });
}
exports.fromEncodingQueries = fromEncodingQueries;
