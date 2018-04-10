"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var related_views_1 = require("../actions/related-views");
var related_views_2 = require("./related-views");
describe('reducers/related-views', function () {
    it('should toggle relatedViewsToggler to hide related-views', function () {
        var expectedRelatedViews = {
            isCollapsed: true
        };
        expect(related_views_2.relatedViewsReducer({
            isCollapsed: false
        }, {
            type: related_views_1.RELATED_VIEWS_HIDE_TOGGLE,
            payload: {
                newIsCollapsed: true
            }
        })).toEqual(expectedRelatedViews);
    });
});
describe(related_views_1.RELATED_VIEWS_HIDE_TOGGLE, function () {
    it('should toggle relatedViewToggler to unhide related-views', function () {
        var expectedRelatedViews = {
            isCollapsed: false
        };
        expect(related_views_2.relatedViewsReducer({
            isCollapsed: true
        }, {
            type: related_views_1.RELATED_VIEWS_HIDE_TOGGLE,
            payload: {
                newIsCollapsed: false
            }
        })).toEqual(expectedRelatedViews);
    });
});
describe(related_views_1.RELATED_VIEWS_HIDE_TOGGLE, function () {
    it('should toggle relatedViewToggler to hide related-views based on config value set to true ' +
        'when default state value undefined', function () {
        var expectedRelatedViews = {
            isCollapsed: false
        };
        expect(related_views_2.relatedViewsReducer({
            isCollapsed: undefined
        }, {
            type: related_views_1.RELATED_VIEWS_HIDE_TOGGLE,
            payload: {
                newIsCollapsed: false
            }
        })).toEqual(expectedRelatedViews);
    });
});
describe(related_views_1.RELATED_VIEWS_HIDE_TOGGLE, function () {
    it('should toggle relatedViewToggler to show related-views based on config value set to false when default ' +
        'state value undefined', function () {
        var expectedRelatedViews = {
            isCollapsed: true
        };
        expect(related_views_2.relatedViewsReducer({
            isCollapsed: undefined
        }, {
            type: related_views_1.RELATED_VIEWS_HIDE_TOGGLE,
            payload: {
                newIsCollapsed: true
            }
        })).toEqual(expectedRelatedViews);
    });
});
//# sourceMappingURL=related-view.test.js.map