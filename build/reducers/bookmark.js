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
var actions_1 = require("../actions");
var models_1 = require("../models");
function bookmarkReducer(bookmark, action) {
    if (bookmark === void 0) { bookmark = models_1.DEFAULT_BOOKMARK; }
    var count = bookmark.count, dict = bookmark.dict, list = bookmark.list;
    switch (action.type) {
        case actions_1.BOOKMARK_ADD_PLOT: {
            var plot = action.payload.plot;
            var specKey = JSON.stringify(plot.spec);
            return {
                dict: __assign({}, dict, (_a = {}, _a[specKey] = {
                    plot: plot,
                    note: '',
                }, _a)),
                count: count + 1,
                list: list.concat([specKey])
            };
        }
        case actions_1.BOOKMARK_MODIFY_NOTE: {
            var _b = action.payload, note = _b.note, spec = _b.spec;
            var specKey = JSON.stringify(spec);
            return {
                dict: __assign({}, dict, (_c = {}, _c[specKey] = __assign({}, dict[specKey], { note: note }), _c)),
                count: count,
                list: list
            };
        }
        case actions_1.BOOKMARK_REMOVE_PLOT: {
            var spec = action.payload.spec;
            var specKey_1 = JSON.stringify(spec);
            var _d = specKey_1, _ = dict[_d], newDict = __rest(dict, [typeof _d === "symbol" ? _d : _d + ""]);
            return {
                dict: newDict,
                count: count - 1,
                list: list.filter(function (item) { return item !== specKey_1; })
            };
        }
        case actions_1.BOOKMARK_CLEAR_ALL: {
            return models_1.DEFAULT_BOOKMARK;
        }
    }
    return bookmark;
    var _a, _c;
}
exports.bookmarkReducer = bookmarkReducer;
//# sourceMappingURL=bookmark.js.map