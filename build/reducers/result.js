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
var fielddef_1 = require("vega-lite/build/src/fielddef");
var util_1 = require("vega-lite/build/src/util");
var actions_1 = require("../actions");
var result_1 = require("../actions/result");
var models_1 = require("../models");
var spec_1 = require("./shelf/spec");
var util_2 = require("./util");
exports.DEFAULT_LIMIT = {
    main: 12,
    addCategoricalField: 4,
    addQuantitativeField: 4,
    addTemporalField: 2,
    alternativeEncodings: 2,
    summaries: 2,
    histograms: 12
};
function resultReducer(state, action, resultType) {
    if (state === void 0) { state = models_1.DEFAULT_RESULT; }
    switch (action.type) {
        case actions_1.RESULT_REQUEST:
            return __assign({}, state, { isLoading: true, plots: undefined, query: undefined, limit: exports.DEFAULT_LIMIT[resultType] });
        case actions_1.RESULT_RECEIVE: {
            var _a = action.payload, plots = _a.plots, query = _a.query;
            return __assign({}, state, { isLoading: false, plots: plots,
                query: query });
        }
        case result_1.RESULT_LIMIT_INCREASE:
            var increment = action.payload.increment;
            return __assign({}, state, { limit: state.limit + increment });
        case result_1.RESULT_MODIFY_FIELD_PROP:
        case result_1.RESULT_MODIFY_NESTED_FIELD_PROP: {
            var index = action.payload.index;
            return __assign({}, state, { plots: util_2.modifyItemInArray(state.plots, index, function (p) {
                    return __assign({}, p, { spec: __assign({}, p.spec, { encoding: resultPlotSpecModifyFieldReducer(p.spec.encoding, action) }) });
                }) });
        }
    }
    return state;
}
function resultPlotSpecModifyFieldReducer(encoding, action) {
    var _a = action.payload, channel = _a.channel, prop = _a.prop, value = _a.value;
    var channelDef = encoding[channel];
    if (!channelDef) {
        console.error(action.type + " no working for channel " + channel + " without field.");
    }
    else if (util_1.isArray(channelDef)) {
        console.error(action.type + "  not supported for detail and order");
        return encoding;
    }
    else if (!fielddef_1.isFieldDef(channelDef)) {
        console.error(action.type + "  not supported for detail and order");
        return encoding;
    }
    var fieldDef = encoding[channel];
    switch (action.type) {
        case result_1.RESULT_MODIFY_FIELD_PROP:
            return __assign({}, encoding, (_b = {}, _b[channel] = spec_1.modifyFieldProp(fieldDef, prop, value), _b));
        case result_1.RESULT_MODIFY_NESTED_FIELD_PROP: {
            var nestedProp = action.payload.nestedProp;
            return __assign({}, encoding, (_c = {}, _c[channel] = spec_1.modifyNestedFieldProp(fieldDef, prop, nestedProp, value), _c));
        }
    }
    return encoding;
    var _b, _c;
}
function resultIndexReducer(state, action) {
    if (state === void 0) { state = models_1.DEFAULT_RESULT_INDEX; }
    if (result_1.isResultAction(action)) {
        var resultType = action.payload.resultType;
        return __assign({}, (action.type === actions_1.RESULT_REQUEST && resultType === 'main' ?
            // When making a main query result request, reset all other results
            // as the older related views results will be outdated anyway.
            models_1.DEFAULT_RESULT_INDEX :
            state), (_a = {}, _a[resultType] = resultReducer(state[resultType], action, resultType), _a));
    }
    return state;
    var _a;
}
exports.resultIndexReducer = resultIndexReducer;
//# sourceMappingURL=result.js.map