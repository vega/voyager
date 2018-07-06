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
var schema_1 = require("compassql/build/src/schema");
var shelf_1 = require("../../actions/shelf");
var spec_1 = require("../../actions/shelf/spec");
var models_1 = require("../../models");
var spec_2 = require("./spec");
var SHORT_WILDCARD = '?';
var schema = new schema_1.Schema({ fields: [] });
describe('reducers/shelf/spec', function () {
    describe(shelf_1.SPEC_CLEAR, function () {
        it('should return DEFAULT_SHELF_UNIT_SPEC', function () {
            expect(spec_2.shelfSpecReducer({
                mark: 'bar', encoding: {}, anyEncodings: [], config: {}
            }, { type: shelf_1.SPEC_CLEAR })).toBe(models_1.DEFAULT_SHELF_UNIT_SPEC);
        });
    });
    describe(shelf_1.SPEC_MARK_CHANGE_TYPE, function () {
        it('should return shelf spec with new mark', function () {
            var shelfSpec = spec_2.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SPEC_MARK_CHANGE_TYPE,
                payload: 'area'
            });
            expect(shelfSpec.mark).toBe('area');
        });
    });
    describe(shelf_1.SPEC_FIELD_ADD, function () {
        it('should correctly add field to channel', function () {
            var shelfSpec = spec_2.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SPEC_FIELD_ADD,
                payload: {
                    shelfId: { channel: 'x' },
                    fieldDef: { field: 'a', type: 'quantitative' },
                    replace: true
                }
            });
            expect(shelfSpec.encoding.x).toEqual({
                field: 'a', type: 'quantitative'
            });
        });
        it('should correctly add field to wildcard channel', function () {
            var shelfSpec = spec_2.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SPEC_FIELD_ADD,
                payload: {
                    shelfId: { channel: SHORT_WILDCARD, index: 0 },
                    fieldDef: { field: 'a', type: 'quantitative' },
                    replace: true
                }
            });
            expect(shelfSpec.anyEncodings[0]).toEqual({
                channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'
            });
            var insertedShelf = spec_2.shelfSpecReducer(shelfSpec, {
                type: shelf_1.SPEC_FIELD_ADD,
                payload: {
                    shelfId: { channel: SHORT_WILDCARD, index: 1 },
                    fieldDef: { field: 'b', type: 'quantitative' },
                    replace: true
                }
            });
            expect(insertedShelf.anyEncodings[0]).toEqual({
                channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'
            });
            expect(insertedShelf.anyEncodings[1]).toEqual({
                channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'
            });
        });
        it('should correctly replace field when dragging onto an existing wildcard shelf', function () {
            var shelfSpec = spec_2.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SPEC_FIELD_ADD,
                payload: {
                    shelfId: { channel: SHORT_WILDCARD, index: 0 },
                    fieldDef: { field: 'a', type: 'quantitative' },
                    replace: true
                }
            });
            expect(shelfSpec.anyEncodings[0]).toEqual({
                channel: SHORT_WILDCARD, field: 'a', type: 'quantitative'
            });
            var insertedShelf = spec_2.shelfSpecReducer(shelfSpec, {
                type: shelf_1.SPEC_FIELD_ADD,
                payload: {
                    shelfId: { channel: SHORT_WILDCARD, index: 0 },
                    fieldDef: { field: 'b', type: 'quantitative' },
                    replace: true
                }
            });
            expect(insertedShelf.anyEncodings[0]).toEqual({
                channel: SHORT_WILDCARD, field: 'b', type: 'quantitative'
            });
        });
    });
    describe(shelf_1.SPEC_FIELD_REMOVE, function () {
        it('should correctly remove field from channel', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SPEC_FIELD_REMOVE,
                payload: { channel: 'x' }
            });
            expect(shelfSpec).toEqual(models_1.DEFAULT_SHELF_UNIT_SPEC);
        });
        it('should correctly remove field from wildcard channel shelf', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: '?', field: 'a', type: 'quantitative' }
                ] }), {
                type: shelf_1.SPEC_FIELD_REMOVE,
                payload: {
                    channel: SHORT_WILDCARD,
                    index: 0
                }
            });
            expect(shelfSpec).toEqual(models_1.DEFAULT_SHELF_UNIT_SPEC);
        });
    });
    describe(shelf_1.SPEC_FIELD_MOVE, function () {
        it('should correct move field to an empty channel', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SPEC_FIELD_MOVE,
                payload: {
                    from: { channel: 'x' },
                    to: { channel: 'y' }
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    y: { field: 'a', type: 'quantitative' }
                } }));
        });
        it('should correctly swap field to if move to a non-empty channel', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' },
                    y: { field: 'b', type: 'quantitative' }
                } }), {
                type: shelf_1.SPEC_FIELD_MOVE,
                payload: {
                    from: { channel: 'x' },
                    to: { channel: 'y' }
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'b', type: 'quantitative' },
                    y: { field: 'a', type: 'quantitative' }
                } }));
        });
        it('should correctly swap field between non-wildcard channel and wildcard channel', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                }, anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'b', type: 'quantitative' }
                ] }), {
                type: shelf_1.SPEC_FIELD_MOVE,
                payload: {
                    from: { channel: 'x' },
                    to: { channel: SHORT_WILDCARD, index: 0 }
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'b', type: 'quantitative' }
                }, anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'a', type: 'quantitative' }
                ] }));
        });
        it('should correctly move field from non-wildcard channel to and empty wildcard channel', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SPEC_FIELD_MOVE,
                payload: {
                    from: { channel: 'x' },
                    to: { channel: SHORT_WILDCARD, index: 0 }
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'a', type: 'quantitative' }
                ] }));
        });
        it('correctly moves field from a wildcard channel to and a non-wildcard channel', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'a', type: 'quantitative' }
                ] }), {
                type: shelf_1.SPEC_FIELD_MOVE,
                payload: {
                    from: { channel: SHORT_WILDCARD, index: 0 },
                    to: { channel: 'x' }
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }));
        });
    });
    describe(spec_1.SPEC_FIELD_PROP_CHANGE, function () {
        it('should correctly change sort of x-field to "descending"', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: spec_1.SPEC_FIELD_PROP_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    prop: 'sort',
                    value: 'descending'
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative', sort: 'descending' }
                } }));
        });
        it('should correctly change sort of x-field to undefined', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: spec_1.SPEC_FIELD_PROP_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    prop: 'sort',
                    value: undefined
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }));
        });
    });
    describe(spec_1.SPEC_FIELD_NESTED_PROP_CHANGE, function () {
        it('should correctly change scale type of x-field to "log"', function () {
            var action = {
                type: spec_1.SPEC_FIELD_NESTED_PROP_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    prop: 'scale',
                    nestedProp: 'type',
                    value: 'log'
                }
            };
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), action);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative', scale: { type: 'log' } }
                } }));
        });
        it('should correctly remove scale type', function () {
            var action = {
                type: spec_1.SPEC_FIELD_NESTED_PROP_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    prop: 'scale',
                    nestedProp: 'type',
                    value: undefined
                }
            };
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative', scale: { type: 'log' } }
                } }), action);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }));
        });
    });
    describe(shelf_1.SPEC_FUNCTION_CHANGE, function () {
        it('should correctly change function of x-field to aggregate:mean', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SPEC_FUNCTION_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: 'mean'
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: 'mean', field: 'a', type: 'quantitative' }
                } }));
        });
        it('should correctly change function of x-field to timeUnit:month', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'temporal' }
                } }), {
                type: shelf_1.SPEC_FUNCTION_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: 'month'
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: 'month', field: 'a', type: 'temporal' }
                } }));
        });
        it('should correctly change function of x-field to bin:true', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SPEC_FUNCTION_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: 'bin'
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: 'bin', field: 'a', type: 'quantitative' } // what do we do for bin????
                } }));
        });
        it('should correctly change function of field with wildcard shelf to mean', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'b', type: 'quantitative' }
                ] }), {
                type: shelf_1.SPEC_FUNCTION_CHANGE,
                payload: {
                    shelfId: { channel: SHORT_WILDCARD, index: 0 },
                    fn: 'mean'
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { fn: 'mean', channel: SHORT_WILDCARD, field: 'b', type: 'quantitative' }
                ] }));
        });
        it('should correctly change function of x-field to no function', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: 'mean', field: 'a', type: 'quantitative' }
                } }), {
                type: shelf_1.SPEC_FUNCTION_CHANGE,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: undefined
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }));
        });
    });
    describe(spec_1.SPEC_FUNCTION_ADD_WILDCARD, function () {
        it('should correctly add a quantitative function to enum', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: { enum: ['sum'] }, field: 'a', type: 'quantitative' }
                } }), {
                type: spec_1.SPEC_FUNCTION_ADD_WILDCARD,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: 'bin'
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', fn: { enum: ['bin', 'sum'] }, type: 'quantitative' }
                } }));
        });
        it('should correctly add a temporal function to enum', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: { enum: ['year'] }, field: 'a', type: 'temporal' }
                } }), {
                type: spec_1.SPEC_FUNCTION_ADD_WILDCARD,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: undefined
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', fn: { enum: [undefined, 'year'] }, type: 'temporal' }
                } }));
        });
    });
    describe(spec_1.SPEC_FUNCTION_DISABLE_WILDCARD, function () {
        it('should assign undefined to fn when nothing is enumerated', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: { enum: [] }, field: 'a', type: 'temporal' }
                } }), {
                type: spec_1.SPEC_FUNCTION_DISABLE_WILDCARD,
                payload: {
                    shelfId: { channel: 'x' },
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'temporal' }
                } }));
        });
        it('should assign the first enum value to fn when wildcard is disabled', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: { enum: ['mean', 'median', 'sum'] }, field: 'a', type: 'quantitative' }
                } }), {
                type: spec_1.SPEC_FUNCTION_DISABLE_WILDCARD,
                payload: {
                    shelfId: { channel: 'x' },
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', fn: 'mean', type: 'quantitative' }
                } }));
        });
    });
    describe(spec_1.SPEC_FUNCTION_ENABLE_WILDCARD, function () {
        it('should correctly change an aggregate function to wildcard', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: 'mean', field: 'a', type: 'quantitative' }
                } }), {
                type: spec_1.SPEC_FUNCTION_ENABLE_WILDCARD,
                payload: {
                    shelfId: { channel: 'x' }
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', fn: { enum: ['mean'] }, type: 'quantitative' }
                } }));
        });
        it('should correctly change a temporal function to wildcard', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: 'year', field: 'a', type: 'temporal' }
                } }), {
                type: spec_1.SPEC_FUNCTION_ENABLE_WILDCARD,
                payload: {
                    shelfId: { channel: 'x' }
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', fn: { enum: ['year'] }, type: 'temporal' }
                } }));
        });
        it('should correctly change undefined to wildcard', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }), {
                type: spec_1.SPEC_FUNCTION_ENABLE_WILDCARD,
                payload: {
                    shelfId: { channel: 'x' }
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', fn: { enum: [undefined] }, type: 'quantitative' }
                } }));
        });
    });
    describe(spec_1.SPEC_FUNCTION_REMOVE_WILDCARD, function () {
        it('should remove a wildcard function', function () {
            var shelfSpec = spec_2.shelfSpecReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { fn: { enum: [undefined, 'mean', 'median', 'sum'] }, field: 'a', type: 'quantitative' }
                } }), {
                type: spec_1.SPEC_FUNCTION_REMOVE_WILDCARD,
                payload: {
                    shelfId: { channel: 'x' },
                    fn: undefined
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', fn: { enum: ['mean', 'median', 'sum'] }, type: 'quantitative' }
                } }));
        });
    });
    describe(shelf_1.SPEC_VALUE_CHANGE, function () {
        it('should change the constant value for a channel', function () {
            var shelfSpec = spec_2.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SPEC_VALUE_CHANGE,
                payload: {
                    shelfId: { channel: 'color' },
                    valueDef: { value: 'blue' }
                }
            });
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    color: { value: 'blue' }
                } }));
        });
        it('should throw error if value supplied for wildcard channel', function () {
            var shelfId = {
                channel: SHORT_WILDCARD,
                index: 0
            };
            expect(function () { return spec_2.shelfSpecReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SPEC_VALUE_CHANGE,
                payload: {
                    shelfId: shelfId,
                    valueDef: { value: 'blue' }
                }
            }); }).toThrowError('constant value cannot be assigned to a wildcard channel');
        });
    });
    describe('shelfSpecFieldAutoAddReducer / ' + shelf_1.SPEC_FIELD_AUTO_ADD, function () {
        it('should query for new spec with CompassQL if there is no wildcard channel in the shelf ' +
            'and the field is not a wildcard.', function () {
            var shelfSpec = spec_2.shelfSpecFieldAutoAddReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SPEC_FIELD_AUTO_ADD,
                payload: {
                    fieldDef: { field: 'a', type: 'quantitative' }
                }
            }, schema);
            expect(shelfSpec).toEqual(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { encoding: {
                    x: { field: 'a', type: 'quantitative' }
                } }));
        });
        it('should add the field to anyEncodings if there is a wildcard channel in the shelf', function () {
            var shelfSpec = spec_2.shelfSpecFieldAutoAddReducer(__assign({}, models_1.DEFAULT_SHELF_UNIT_SPEC, { anyEncodings: [
                    { channel: SHORT_WILDCARD, field: 'a', type: 'quantitative' }
                ] }), {
                type: shelf_1.SPEC_FIELD_AUTO_ADD,
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
            var shelfSpec = spec_2.shelfSpecFieldAutoAddReducer(models_1.DEFAULT_SHELF_UNIT_SPEC, {
                type: shelf_1.SPEC_FIELD_AUTO_ADD,
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
});
//# sourceMappingURL=spec.test.js.map