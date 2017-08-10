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
var shelf_1 = require("../../actions/shelf");
var models_1 = require("../../models");
var spec_1 = require("./spec");
var SHORT_WILDCARD = '?';
// FIXME doing property import can break the test
// import {SHORT_WILDCARD} from 'compassql/build/src/wildcard';
var schema_1 = require("compassql/build/src/schema");
var shelf_2 = require("../../actions/shelf");
var schema = new schema_1.Schema({ fields: [] });
describe('reducers/shelf/spec', function () {
    describe(shelf_1.SHELF_CLEAR, function () {
        it('should return DEFAULT_SHELF_UNIT_SPEC', function () {
            expect(spec_1.shelfSpecReducer({
                mark: 'bar', encoding: {}, anyEncodings: [], config: {}, filters: []
            }, { type: shelf_1.SHELF_CLEAR }, schema)).toBe(models_1.DEFAULT_SHELF_UNIT_SPEC);
        });
    });
    describe(shelf_1.SHELF_MARK_CHANGE_TYPE, function () {
        it('should return shelf spec with new mark', function () {
            var shelfSpec = spec_1.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SHELF_MARK_CHANGE_TYPE,
                payload: 'area'
            }, schema);
            expect(shelfSpec.mark).toBe('area');
        });
    });
    describe(shelf_1.SHELF_FIELD_ADD, function () {
        it('should correctly add field to channel', function () {
            var shelfSpec = spec_1.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SHELF_FIELD_ADD,
                payload: {
                    shelfId: { channel: 'x' },
                    fieldDef: { field: 'a', type: 'quantitative' },
                    replace: true
                }
            }, schema);
            expect(shelfSpec.encoding.x).toEqual({
                field: 'a', type: 'quantitative'
            });
        });
        it('should correctly add field to wildcard channel', function () {
            var shelfSpec = spec_1.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SHELF_FIELD_ADD,
                payload: {
                    shelfId: { channel: SHORT_WILDCARD, index: 0 },
                    fieldDef: { field: 'a', type: 'quantitative' },
                    replace: true
                }
            }, schema);
            expect(shelfSpec.anyEncodings[0]).toEqual({
                channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'
            });
            var insertedShelf = spec_1.shelfSpecReducer(shelfSpec, {
                type: shelf_1.SHELF_FIELD_ADD,
                payload: {
                    shelfId: { channel: SHORT_WILDCARD, index: 1 },
                    fieldDef: { field: 'b', type: 'quantitative' },
                    replace: true
                }
            }, schema);
            expect(insertedShelf.anyEncodings[0]).toEqual({
                channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'
            });
            expect(insertedShelf.anyEncodings[1]).toEqual({
                channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'
            });
        });
        it('should correctly replace field when dragging onto an existing wildcard shelf', function () {
            var shelfSpec = spec_1.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SHELF_FIELD_ADD,
                payload: {
                    shelfId: { channel: SHORT_WILDCARD, index: 0 },
                    fieldDef: { field: 'a', type: 'quantitative' },
                    replace: true
                }
            }, schema);
            expect(shelfSpec.anyEncodings[0]).toEqual({
                channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'
            });
            var insertedShelf = spec_1.shelfSpecReducer(shelfSpec, {
                type: shelf_1.SHELF_FIELD_ADD,
                payload: {
                    shelfId: { channel: SHORT_WILDCARD, index: 0 },
                    fieldDef: { field: 'b', type: 'quantitative' },
                    replace: true
                }
            }, schema);
            expect(insertedShelf.anyEncodings[0]).toEqual({
                channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'
            });
        });
    });
    describe(shelf_1.SHELF_FIELD_ADD, function () {
        it('should query for new spec with CompassQL if there is no wildcard channel in the shelf ' +
            'and the field is not a wildcard.', function () {
            var shelfSpec = spec_1.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SHELF_FIELD_AUTO_ADD,
                payload: {
                    fieldDef: { field: 'a', type: 'quantitative' }
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }));
        });
        it('should add the field to anyEncodings if there is a wildcard channel in the shelf', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'a', type: 'quantitative' }
                ] }), {
                type: shelf_1.SHELF_FIELD_AUTO_ADD,
                payload: {
                    fieldDef: { field: 'b', type: 'nominal' }
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'a', type: 'quantitative' },
                    { channel: SHORT_WILDCARD, field: 'b', type: 'nominal' }
                ] }));
        });
        it('should add the field to anyEncodings if the field is a wildcard', function () {
            var shelfSpec = spec_1.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SHELF_FIELD_AUTO_ADD,
                payload: {
                    fieldDef: {
                        field: { enum: ['a', 'b'] },
                        type: 'nominal'
                    }
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: SHORT_WILDCARD, field: { enum: ['a', 'b'] }, type: 'nominal' }
                ] }));
        });
    });
    describe(shelf_1.SHELF_FIELD_REMOVE, function () {
        it('should correctly remove field from channel', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SHELF_FIELD_REMOVE,
                payload: { channel: 'x' }
            }, schema);
            expect(shelfSpec).toEqual(models_1.DEFAULT_SHELF_UNIT_SPEC);
        });
        it('should correctly remove field from wildcard channel shelf', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: '?', field: 'a', type: 'quantitative' }
                ] }), {
                type: shelf_1.SHELF_FIELD_REMOVE,
                payload: {
                    channel: SHORT_WILDCARD,
                    index: 0
                }
            }, schema);
            expect(shelfSpec).toEqual(models_1.DEFAULT_SHELF_UNIT_SPEC);
        });
    });
    describe(shelf_1.SHELF_FIELD_MOVE, function () {
        it('should correct move field to an empty channel', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SHELF_FIELD_MOVE,
                payload: {
                    from: { channel: 'x' },
                    to: { channel: 'y' }
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    y: { field: 'a', type: 'quantitative' }
                } }));
        });
        it('should correctly swap field to if move to a non-empty channel', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' },
                    y: { field: 'b', type: 'quantitative' }
                } }), {
                type: shelf_1.SHELF_FIELD_MOVE,
                payload: {
                    from: { channel: 'x' },
                    to: { channel: 'y' }
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'b', type: 'quantitative' },
                    y: { field: 'a', type: 'quantitative' }
                } }));
        });
        it('should correctly swap field between non-wildcard channel and wildcard channel', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                }, anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'b', type: 'quantitative' }
                ] }), {
                type: shelf_1.SHELF_FIELD_MOVE,
                payload: {
                    from: { channel: 'x' },
                    to: { channel: SHORT_WILDCARD, index: 0 }
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'b', type: 'quantitative' }
                }, anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'a', type: 'quantitative' }
                ] }));
        });
        it('should correctly move field from non-wildcard channel to and empty wildcard channel', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SHELF_FIELD_MOVE,
                payload: {
                    from: { channel: 'x' },
                    to: { channel: SHORT_WILDCARD, index: 0 }
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'a', type: 'quantitative' }
                ] }));
        });
        it('correctly moves field from a wildcard channel to and a non-wildcard channel', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'a', type: 'quantitative' }
                ] }), {
                type: shelf_1.SHELF_FIELD_MOVE,
                payload: {
                    from: { channel: SHORT_WILDCARD, index: 0 },
                    to: { channel: 'x' }
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }));
        });
    });
    describe(shelf_1.SHELF_FUNCTION_CHANGE, function () {
        it('should correctly change function of x-field to aggregate:mean', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SHELF_FUNCTION_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: 'mean'
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: 'mean', field: 'a', type: 'quantitative' }
                } }));
        });
        it('should correctly change function of x-field to timeUnit:month', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'temporal' }
                } }), {
                type: shelf_1.SHELF_FUNCTION_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: 'month'
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: 'month', field: 'a', type: 'temporal' }
                } }));
        });
        it('should correctly change function of x-field to bin:true', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SHELF_FUNCTION_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: 'bin'
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: 'bin', field: 'a', type: 'quantitative' } // what do we do for bin????
                } }));
        });
        it('should correctly change function of field with wildcard shelf to mean', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'b', type: 'quantitative' }
                ] }), {
                type: shelf_1.SHELF_FUNCTION_CHANGE,
                payload: {
                    shelfId: { channel: SHORT_WILDCARD, index: 0 },
                    fn: 'mean'
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { fn: 'mean', channel: SHORT_WILDCARD, field: 'b', type: 'quantitative' }
                ] }));
        });
        it('should correctly change function of x-field to no function', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: 'mean', field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SHELF_FUNCTION_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: undefined
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }));
        });
    });
    describe(shelf_2.SHELF_SPEC_LOAD, function () {
        it('loads spec and retains wildcard mark if the shelf has wildcard mark and keep wildcard mark is true', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { mark: SHORT_WILDCARD }), {
                type: shelf_2.SHELF_SPEC_LOAD,
                payload: {
                    spec: {
                        mark: 'bar',
                        encoding: {
                            x: { field: 'b', type: 'nominal' },
                            y: { aggregate: 'count', field: '*', type: 'quantitative' }
                        }
                    },
                    keepWildcardMark: true
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { mark: SHORT_WILDCARD, encoding: {
                    x: { field: 'b', type: 'nominal' },
                    y: { field: '*', fn: 'count', type: 'quantitative' }
                } }));
        });
        it('completely loads spec if the shelf has no wildcard mark', function () {
            var shelfSpec = spec_1.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { mark: 'point' }), {
                type: shelf_2.SHELF_SPEC_LOAD,
                payload: {
                    spec: {
                        mark: 'bar',
                        encoding: {
                            x: { field: 'b', type: 'nominal' },
                            y: { field: '*', aggregate: 'count', type: 'quantitative' }
                        }
                    },
                    keepWildcardMark: true
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { mark: 'bar', encoding: {
                    x: { field: 'b', type: 'nominal' },
                    y: { fn: 'count', field: '*', type: 'quantitative' }
                } }));
        });
    });
});
