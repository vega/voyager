"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shelf_1 = require("../../models/shelf");
var spec_1 = require("./spec");
function shelfReducer(shelf, action, schema) {
    if (shelf === void 0) { shelf = shelf_1.DEFAULT_SHELF; }
    var spec = spec_1.shelfSpecReducer(shelf.spec, action, schema);
    if (spec !== shelf.spec) {
        // Make sure we only re-create a new object if something has changed.
        // TODO: once we have more query-based property here, better use some combineReducers() like function.
        // The problem is that combineReducer does not support additional parameter like `schema`
        // that we need for `shelfSpecReducer`
        return { spec: spec };
    }
    return shelf;
}
exports.shelfReducer = shelfReducer;
