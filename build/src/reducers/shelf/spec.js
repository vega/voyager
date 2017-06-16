"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var spec_1 = require("compassql/build/src/query/spec");
var recommend_1 = require("compassql/build/src/recommend");
var wildcard_1 = require("compassql/build/src/wildcard");
var shelf_1 = require("../../actions/shelf");
var aggregate_1 = require("vega-lite/build/src/aggregate");
var timeunit_1 = require("vega-lite/build/src/timeunit");
var models_1 = require("../../models");
var index_1 = require("../../models/shelf/index");
var spec_2 = require("../../models/shelf/spec");
var util_1 = require("../../util");
function shelfSpecReducer(shelfSpec, action, schema) {
    switch (action.type) {
        case shelf_1.SHELF_CLEAR:
            return spec_2.DEFAULT_SHELF_UNIT_SPEC;
        case shelf_1.SHELF_MARK_CHANGE_TYPE: {
            var mark = action.payload;
            return __assign({}, shelfSpec, { mark: mark });
        }
        case shelf_1.SHELF_FIELD_ADD: {
            var _c = action.payload, shelfId = _c.shelfId, fieldDef = _c.fieldDef;
            return addEncoding(shelfSpec, shelfId, fieldDef);
        }
        case shelf_1.SHELF_FIELD_AUTO_ADD: {
            var fieldDef = action.payload.fieldDef;
            if (shelfSpec.anyEncodings.length > 0 || wildcard_1.isWildcard(fieldDef.field)) {
                // If there was an encoding shelf or if the field is a wildcard, just add to wildcard shelf
                return __assign({}, shelfSpec, { anyEncodings: shelfSpec.anyEncodings.concat([
                        __assign({ channel: wildcard_1.SHORT_WILDCARD }, fieldDef)
                    ]) });
            }
            else {
                // Otherwise, query for the best encoding if there is no wildcard channel
                var query = index_1.autoAddFieldQuery(shelfSpec, fieldDef);
                var rec = recommend_1.recommend(query, schema);
                var topSpecQuery = rec.result.getTopSpecQueryItem().specQuery;
                return __assign({}, spec_2.fromSpecQuery(topSpecQuery, shelfSpec.config), (wildcard_1.isWildcard(shelfSpec.mark) ? { mark: shelfSpec.mark } : {}));
            }
        }
        case shelf_1.SHELF_FIELD_REMOVE:
            return removeEncoding(shelfSpec, action.payload).shelf;
        case shelf_1.SHELF_FIELD_MOVE: {
            var _d = action.payload, to = _d.to, from = _d.from;
            var _e = removeEncoding(shelfSpec, from), fieldDefFrom = _e.fieldDef, removedShelf1 = _e.shelf;
            var _f = removeEncoding(removedShelf1, to), fieldDefTo = _f.fieldDef, removedShelf2 = _f.shelf;
            var addedShelf1 = addEncoding(removedShelf2, to, fieldDefFrom);
            var addedShelf2 = addEncoding(addedShelf1, from, fieldDefTo);
            return addedShelf2;
        }
        case shelf_1.SHELF_FUNCTION_CHANGE: {
            var _g = action.payload, shelfId = _g.shelfId, fn_1 = _g.fn;
            return modifyEncoding(shelfSpec, shelfId, function (fieldDef) {
                // Remove all existing functions then assign new function
                var _a = fieldDef.aggregate, _b = fieldDef.bin, _t = fieldDef.timeUnit, _h = fieldDef.hasFn, newFieldDef = __rest(fieldDef, ["aggregate", "bin", "timeUnit", "hasFn"]);
                return __assign({}, newFieldDef, (getFunctionMixins(fn_1)));
            });
        }
        case shelf_1.SHELF_SPEC_LOAD:
            var spec = action.payload.spec;
            var specQ = wildcard_1.isWildcard(shelfSpec.mark) ? __assign({}, spec_1.fromSpec(spec), { mark: wildcard_1.SHORT_WILDCARD }) : spec_1.fromSpec(spec);
            // Restore wildcard mark if the shelf previously has wildcard mark.
            return spec_2.fromSpecQuery(specQ, shelfSpec.config);
    }
    return shelfSpec;
}
exports.shelfSpecReducer = shelfSpecReducer;
var AGGREGATE_INDEX = util_1.toSet(aggregate_1.AGGREGATE_OPS);
var TIMEUNIT_INDEX = util_1.toSet(timeunit_1.TIMEUNITS);
function getFunctionMixins(fn) {
    if (AGGREGATE_INDEX[fn]) {
        return { aggregate: fn };
    }
    if (fn === 'bin') {
        return { bin: true };
    }
    if (TIMEUNIT_INDEX[fn]) {
        return { timeUnit: fn };
    }
    return undefined;
}
function addEncoding(shelf, shelfId, fieldDef) {
    if (!fieldDef) {
        return shelf;
    }
    else if (models_1.isWildcardChannelId(shelfId)) {
        return __assign({}, shelf, { anyEncodings: insert(shelf.anyEncodings, shelfId.index, __assign({ channel: wildcard_1.SHORT_WILDCARD }, fieldDef)) });
    }
    else {
        return __assign({}, shelf, { encoding: __assign({}, shelf.encoding, (_c = {}, _c[shelfId.channel] = fieldDef, _c)) });
    }
    var _c;
}
function modifyEncoding(shelf, shelfId, modifier) {
    if (models_1.isWildcardChannelId(shelfId)) {
        return __assign({}, shelf, { anyEncodings: modify(shelf.anyEncodings, shelfId.index, modifier) });
    }
    else {
        return __assign({}, shelf, { encoding: __assign({}, shelf.encoding, (_c = {}, _c[shelfId.channel] = modifier(shelf.encoding[shelfId.channel]), _c)) });
    }
    var _c;
}
function removeEncoding(shelf, shelfId) {
    if (models_1.isWildcardChannelId(shelfId)) {
        var index = shelfId.index;
        var _c = remove(shelf.anyEncodings, index), anyEncodings = _c.array, item = _c.item;
        if (item) {
            // Remove channel from the removed EncodingQuery if the removed shelf is not empty.
            var _ = item.channel, fieldDef = __rest(item, ["channel"]);
            return {
                fieldDef: fieldDef,
                shelf: __assign({}, shelf, { anyEncodings: anyEncodings })
            };
        }
        else {
            return {
                fieldDef: undefined,
                shelf: __assign({}, shelf, { anyEncodings: anyEncodings })
            };
        }
    }
    else {
        var _d = shelf.encoding, _e = shelfId.channel, fieldDef = _d[_e], encoding = __rest(_d, [typeof _e === "symbol" ? _e : _e + ""]);
        return {
            fieldDef: fieldDef,
            shelf: __assign({}, shelf, { encoding: encoding })
        };
    }
}
/**
 * Immutable array splice
 */
function remove(array, index) {
    return {
        item: array[index],
        array: array.slice(0, index).concat(array.slice(index + 1))
    };
}
function insert(array, index, item) {
    return array.slice(0, index).concat([
        item
    ], array.slice(index));
}
function modify(array, index, modifier) {
    return array.slice(0, index).concat([
        modifier(array[index])
    ], array.slice(index + 1));
}
