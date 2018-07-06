"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var related_views_1 = require("../actions/related-views");
var related_views_2 = require("../models/related-views");
function relatedViewsReducer(relatedViewToggler, action) {
    if (relatedViewToggler === void 0) { relatedViewToggler = related_views_2.DEFAULT_RELATED_VIEWS; }
    switch (action.type) {
        case related_views_1.RELATED_VIEWS_HIDE_TOGGLE: {
            var newIsCollapsed = action.payload.newIsCollapsed;
            return {
                isCollapsed: newIsCollapsed
            };
        }
    }
    return relatedViewToggler;
}
exports.relatedViewsReducer = relatedViewsReducer;
//# sourceMappingURL=related-views.js.map