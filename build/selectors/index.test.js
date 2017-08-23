"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bookmark_1 = require("../models/bookmark");
var config_1 = require("../models/config");
var index_1 = require("../models/index");
var shelf_preview_1 = require("../models/shelf-preview");
var index_2 = require("./index");
describe('selectors/index', function () {
    describe('selectBookmark', function () {
        it('selecting bookmark returns default bookmark', function () {
            expect(index_2.selectBookmark(index_1.DEFAULT_STATE)).toBe(bookmark_1.DEFAULT_BOOKMARK);
        });
    });
    describe('selectConfig', function () {
        it('selecting config should returns default voyager config', function () {
            expect(index_2.selectConfig(index_1.DEFAULT_STATE)).toBe(config_1.DEFAULT_VOYAGER_CONFIG);
        });
    });
    describe('selectShelfPreview', function () {
        it('selecting shelf preview should return default shelf preview', function () {
            expect(index_2.selectShelfPreview(index_1.DEFAULT_STATE)).toBe(shelf_preview_1.DEFAULT_SHELF_PREVIEW);
        });
    });
});
//# sourceMappingURL=index.test.js.map