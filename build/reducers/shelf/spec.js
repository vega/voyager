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
var model_1 = require("compassql/build/src/model");
var recommend_1 = require("compassql/build/src/recommend");
var wildcard_1 = require("compassql/build/src/wildcard");
var shelf_1 = require("../../actions/shelf");
var shelf_2 = require("../../actions/shelf");
var spec_1 = require("../../actions/shelf/spec");
var models_1 = require("../../models");
var shelf_3 = require("../../models/shelf");
var shelf_4 = require("../../models/shelf");
var spec_2 = require("../../models/shelf/spec");
var util_1 = require("../util");
function shelfSpecFieldAutoAddReducer(shelfSpec, action, schema) {
    var fieldDef = action.payload.fieldDef;
    if (shelfSpec.anyEncodings.length > 0 || wildcard_1.isWildcard(fieldDef.field)) {
        // If there was an encoding shelf or if the field is a wildcard, just add to wildcard shelf
        return __assign({}, shelfSpec, { anyEncodings: shelfSpec.anyEncodings.concat([
                __assign({ channel: wildcard_1.SHORT_WILDCARD }, fieldDef)
            ]) });
    }
    else {
        // Otherwise, query for the best encoding if there is no wildcard channel
        var query = shelf_4.autoAddFieldQuery(shelfSpec, fieldDef);
        var rec = recommend_1.recommend(query, schema);
        var topSpecQuery = model_1.getTopSpecQueryItem(rec.result).specQuery;
        return __assign({}, spec_2.fromSpecQuery(topSpecQuery, shelfSpec.config), (wildcard_1.isWildcard(shelfSpec.mark) ? { mark: shelfSpec.mark } : {}));
    }
}
exports.shelfSpecFieldAutoAddReducer = shelfSpecFieldAutoAddReducer;
function shelfSpecReducer(shelfSpec, action) {
    if (shelfSpec === void 0) { shelfSpec = spec_2.DEFAULT_SHELF_UNIT_SPEC; }
    switch (action.type) {
        case shelf_1.SPEC_CLEAR:
            return spec_2.DEFAULT_SHELF_UNIT_SPEC;
        case shelf_1.SPEC_MARK_CHANGE_TYPE: {
            var mark = action.payload;
            return __assign({}, shelfSpec, { mark: mark });
        }
        case shelf_1.SPEC_FIELD_ADD: {
            var _a = action.payload, shelfId = _a.shelfId, fieldDef = _a.fieldDef, replace = _a.replace;
            return addEncoding(shelfSpec, shelfId, fieldDef, replace);
        }
        case shelf_1.SPEC_FIELD_REMOVE:
            return removeEncoding(shelfSpec, action.payload).shelf;
        case shelf_1.SPEC_FIELD_MOVE: {
            var _b = action.payload, to = _b.to, from = _b.from;
            var _c = removeEncoding(shelfSpec, from), fieldDefFrom = _c.fieldDef, removedShelf1 = _c.shelf;
            var _d = removeEncoding(removedShelf1, to), fieldDefTo = _d.fieldDef, removedShelf2 = _d.shelf;
            var addedShelf1 = addEncoding(removedShelf2, to, fieldDefFrom, false);
            var addedShelf2 = addEncoding(addedShelf1, from, fieldDefTo, false);
            return addedShelf2;
        }
        case spec_1.SPEC_FIELD_PROP_CHANGE: {
            var _e = action.payload, shelfId = _e.shelfId, prop_1 = _e.prop, value_1 = _e.value;
            return modifyEncoding(shelfSpec, shelfId, function (fieldDef) {
                return modifyFieldProp(fieldDef, prop_1, value_1);
            });
        }
        case spec_1.SPEC_FIELD_NESTED_PROP_CHANGE: {
            var _f = action.payload, shelfId = _f.shelfId, prop_2 = _f.prop, nestedProp_1 = _f.nestedProp, value_2 = _f.value;
            return modifyEncoding(shelfSpec, shelfId, function (fieldDef) {
                return modifyNestedFieldProp(fieldDef, prop_2, nestedProp_1, value_2);
            });
        }
        case shelf_1.SPEC_FUNCTION_CHANGE: {
            var _g = action.payload, shelfId = _g.shelfId, fn_1 = _g.fn;
            return modifyEncoding(shelfSpec, shelfId, function (fieldDef) {
                return __assign({}, fieldDef, { fn: fn_1 });
            });
        }
        case shelf_2.SPEC_FUNCTION_ADD_WILDCARD: {
            var _h = action.payload, shelfId = _h.shelfId, fn_2 = _h.fn;
            return modifyEncoding(shelfSpec, shelfId, function (fieldDef) {
                var oldFn = fieldDef.fn, fieldDefWithoutFn = __rest(fieldDef, ["fn"]);
                return __assign({}, fieldDefWithoutFn, { fn: {
                        enum: shelf_3.sortFunctions(oldFn['enum'].concat(fn_2))
                    } });
            });
        }
        case shelf_2.SPEC_FUNCTION_DISABLE_WILDCARD: {
            var shelfId = action.payload.shelfId;
            return modifyEncoding(shelfSpec, shelfId, function (fieldDef) {
                var fn = fieldDef.fn, fieldDefWithoutFn = __rest(fieldDef, ["fn"]);
                if (wildcard_1.isWildcard(fn)) {
                    return __assign({}, fieldDefWithoutFn, fn.enum.length > 0 ? { fn: fn.enum[0] } : {});
                }
                else {
                    throw Error('fn must be a wildcard to disable wildcard');
                }
            });
        }
        case shelf_1.SPEC_FUNCTION_ENABLE_WILDCARD: {
            var shelfId = action.payload.shelfId;
            return modifyEncoding(shelfSpec, shelfId, function (fieldDef) {
                var fn = fieldDef.fn, fieldDefWithoutFn = __rest(fieldDef, ["fn"]);
                return __assign({}, fieldDefWithoutFn, { fn: {
                        enum: [fn]
                    } });
            });
        }
        case shelf_2.SPEC_FUNCTION_REMOVE_WILDCARD: {
            var _j = action.payload, shelfId = _j.shelfId, fn_3 = _j.fn;
            return modifyEncoding(shelfSpec, shelfId, function (fieldDef) {
                var oldFn = fieldDef.fn, fieldDefWithoutFn = __rest(fieldDef, ["fn"]);
                if (wildcard_1.isWildcard(oldFn)) {
                    return __assign({}, fieldDefWithoutFn, { fn: {
                            enum: oldFn.enum.filter(function (shelfFunc) { return shelfFunc !== fn_3; })
                        } });
                }
                else {
                    throw Error('fn must be a wildcard to remove a wildcard');
                }
            });
        }
    }
    return shelfSpec;
}
exports.shelfSpecReducer = shelfSpecReducer;
function addEncoding(shelf, shelfId, fieldDef, replace) {
    if (!fieldDef) {
        return shelf;
    }
    else if (models_1.isWildcardChannelId(shelfId)) {
        var index = shelfId.index;
        if (replace && shelf.anyEncodings[index]) {
            return __assign({}, shelf, { anyEncodings: util_1.modifyItemInArray(shelf.anyEncodings, index, function () {
                    return __assign({ channel: wildcard_1.SHORT_WILDCARD }, fieldDef);
                }) });
        }
        // insert between two pills (not replace!)
        return __assign({}, shelf, { anyEncodings: util_1.insertItemToArray(shelf.anyEncodings, index, __assign({ channel: wildcard_1.SHORT_WILDCARD }, fieldDef)) });
    }
    else {
        return __assign({}, shelf, { encoding: __assign({}, shelf.encoding, (_a = {}, _a[shelfId.channel] = fieldDef, _a)) });
    }
    var _a;
}
function modifyEncoding(shelf, shelfId, modifier) {
    if (models_1.isWildcardChannelId(shelfId)) {
        return __assign({}, shelf, { anyEncodings: util_1.modifyItemInArray(shelf.anyEncodings, shelfId.index, modifier) });
    }
    else {
        return __assign({}, shelf, { encoding: __assign({}, shelf.encoding, (_a = {}, _a[shelfId.channel] = modifier(shelf.encoding[shelfId.channel]), _a)) });
    }
    var _a;
}
function removeEncoding(shelf, shelfId) {
    if (models_1.isWildcardChannelId(shelfId)) {
        var index = shelfId.index;
        var _a = util_1.removeItemFromArray(shelf.anyEncodings, index), anyEncodings = _a.array, item = _a.item;
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
        var _b = shelf.encoding, _c = shelfId.channel, fieldDef = _b[_c], encoding = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
        return {
            fieldDef: fieldDef,
            shelf: __assign({}, shelf, { encoding: encoding })
        };
    }
}
function modifyFieldProp(fieldDef, prop, value) {
    var _a = prop, _oldProp = fieldDef[_a], fieldDefWithoutProp = __rest(fieldDef, [typeof _a === "symbol" ? _a : _a + ""]);
    return __assign({}, fieldDefWithoutProp, (value !== undefined ? (_b = {}, _b[prop] = value, _b) : {}));
    var _b;
}
exports.modifyFieldProp = modifyFieldProp;
function modifyNestedFieldProp(fieldDef, prop, nestedProp, value) {
    var _a = prop, oldParent = fieldDef[_a], fieldDefWithoutProp = __rest(fieldDef, [typeof _a === "symbol" ? _a : _a + ""]);
    var _b = oldParent || {}, _c = nestedProp, _oldValue = _b[_c], parentWithoutNestedProp = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
    var parent = __assign({}, parentWithoutNestedProp, (value !== undefined ? (_d = {}, _d[nestedProp] = value, _d) : {}));
    return __assign({}, fieldDefWithoutProp, (Object.keys(parent).length > 0 ? (_e = {}, _e[prop] = parent, _e) : {}));
    var _d, _e;
}
exports.modifyNestedFieldProp = modifyNestedFieldProp;
//# sourceMappingURL=spec.js.map