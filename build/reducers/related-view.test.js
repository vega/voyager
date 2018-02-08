"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var related_views_1 = require("../actions/related-views");
var related_views_2 = require("./related-views");
describe('reducers/related-views', function () {
    it('should toggle relatedViewsToggler to hide related-views', function () {
        var expectedRelatedViews = {
            isHidden: true
        };
        expect(related_views_2.relatedViewsReducer({
            isHidden: false
        }, {
            type: related_views_1.RELATED_VIEWS_HIDE_TOGGLE
        })).toEqual(expectedRelatedViews);
    });
});
describe(related_views_1.RELATED_VIEWS_HIDE_TOGGLE, function () {
    it('should toggle relatedViewToggler to unhide related-views', function () {
        var expectedRelatedViews = {
            isHidden: false
        };
        expect(related_views_2.relatedViewsReducer({
            isHidden: true
        }, {
            type: related_views_1.RELATED_VIEWS_HIDE_TOGGLE
        })).toEqual(expectedRelatedViews);
    });
});
//# sourceMappingURL=related-view.test.js.map