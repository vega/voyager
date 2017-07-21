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
function bookmarkReducer(bookmark, action) {
    var count = bookmark.count, dict = bookmark.dict, list = bookmark.list;
    switch (action.type) {
        case actions_1.BOOKMARK_ADD_PLOT: {
            var plotObject = action.payload.plotObject;
            var bookmarkItem = {
                plotObject: plotObject,
                note: '',
            };
            var specKey = JSON.stringify(plotObject.spec);
            return {
                dict: __assign({}, dict, (_a = {}, _a[specKey] = bookmarkItem, _a)),
                count: count + 1,
                list: list.concat([specKey])
            };
        }
        case actions_1.BOOKMARK_MODIFY_NOTE: {
            var _b = action.payload, note = _b.note, spec = _b.spec;
            var specKey = JSON.stringify(spec);
            var modifiedBookmarkItem = __assign({}, dict[specKey], { note: note });
            return {
                dict: __assign({}, dict, (_c = {}, _c[specKey] = modifiedBookmarkItem, _c)),
                count: count,
                list: list.slice()
            };
        }
        case actions_1.BOOKMARK_REMOVE_PLOT: {
            var spec = action.payload.spec;
            var specKey_1 = JSON.stringify(spec);
            var newBookmark = {
                dict: __assign({}, dict),
                count: count - 1,
                list: list.filter(function (item) { return item !== specKey_1; })
            };
            delete newBookmark.dict[specKey_1];
            return newBookmark;
        }
        default: {
            return bookmark;
        }
    }
    var _a, _c;
}
exports.bookmarkReducer = bookmarkReducer;
