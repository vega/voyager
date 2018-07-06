"use strict";
/**
 * Namespace for creating CompassQL query specifications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var nest_1 = require("compassql/build/src/nest");
var spec_1 = require("compassql/build/src/query/spec");
var util_1 = require("compassql/build/src/util");
var util_2 = require("util");
var channel_1 = require("vega-lite/build/src/channel");
var result_1 = require("../actions/result");
var index_1 = require("../selectors/index");
var shelf_1 = require("../selectors/shelf");
var alternative_encodings_1 = require("./alternative-encodings");
var field_suggestions_1 = require("./field-suggestions");
var histograms_1 = require("./histograms");
var summaries_1 = require("./summaries");
exports.RELATED_VIEWS_INDEX = {
    main: undefined,
    addCategoricalField: field_suggestions_1.addCategoricalField,
    addQuantitativeField: field_suggestions_1.addQuantitativeField,
    addTemporalField: field_suggestions_1.addTemporalField,
    alternativeEncodings: alternative_encodings_1.alternativeEncodings,
    summaries: summaries_1.summaries,
    histograms: histograms_1.histograms,
};
var RELATED_VIEWS_PRIORITY = {
    main: undefined,
    histograms: 0,
    summaries: 1,
    addQuantitativeField: 2,
    addCategoricalField: 3,
    addTemporalField: 4,
    alternativeEncodings: 5
};
exports.RELATED_VIEWS_TYPES = Object.keys(exports.RELATED_VIEWS_INDEX)
    .filter(function (type) { return type !== 'main'; })
    .sort(function (t1, t2) { return RELATED_VIEWS_PRIORITY[t1] - RELATED_VIEWS_PRIORITY[t2]; });
function dispatchQueries(store, query) {
    var state = store.getState();
    var isQueryEmpty = shelf_1.selectIsQueryEmpty(state);
    var isQuerySpecific = index_1.selectIsQuerySpecific(state);
    store.dispatch(result_1.resultRequest('main', query, null));
    if (state.persistent.config.relatedViews === 'disabled' || state.persistent.relatedViews.isCollapsed) {
        return;
    }
    if (isQueryEmpty) {
        store.dispatch(relatedViewResultRequest(histograms_1.histograms, query));
    }
    else {
        if (isQuerySpecific) {
            makeRelatedViewQueries(store, query);
        }
    }
}
exports.dispatchQueries = dispatchQueries;
function relatedViewResultRequest(queryCreator, mainQuery) {
    var query = queryCreator.createQuery(mainQuery);
    var mainQueryKey;
    if (queryCreator.filterSpecifiedView) {
        if (!util_2.isString(query.groupBy)) {
            throw new Error('Cannot get key if query.groupBy is not string');
        }
        mainQueryKey = nest_1.getGroupByKey(mainQuery.spec, query.groupBy);
    }
    return result_1.resultRequest(queryCreator.type, query, mainQueryKey);
}
function getFeaturesForRelatedViewRules(spec) {
    var hasOpenPosition = false;
    var hasStyleChannel = false;
    var hasOpenFacet = false;
    spec.encodings.forEach(function (encQ) {
        if (encQ.channel === 'x' || encQ.channel === 'y') {
            hasOpenPosition = true;
        }
        else if (encQ.channel === 'row' || encQ.channel === 'column') {
            hasOpenFacet = true;
        }
        else if (util_1.contains(channel_1.NONPOSITION_SCALE_CHANNELS, encQ.channel)) {
            hasStyleChannel = true;
        }
    });
    return {
        hasOpenPosition: hasOpenPosition,
        hasStyleChannel: hasStyleChannel,
        hasOpenFacet: hasOpenFacet,
        isSpecAggregate: spec_1.isAggregate(spec)
    };
}
function makeRelatedViewQueries(store, query) {
    var _a = getFeaturesForRelatedViewRules(query.spec), hasOpenPosition = _a.hasOpenPosition, hasStyleChannel = _a.hasStyleChannel, hasOpenFacet = _a.hasOpenFacet, isSpecAggregate = _a.isSpecAggregate;
    if (!isSpecAggregate) {
        store.dispatch(relatedViewResultRequest(summaries_1.summaries, query));
    }
    if (hasOpenPosition || hasStyleChannel) {
        store.dispatch(relatedViewResultRequest(field_suggestions_1.addQuantitativeField, query));
    }
    if (hasOpenPosition || hasStyleChannel || hasOpenFacet) {
        store.dispatch(relatedViewResultRequest(field_suggestions_1.addCategoricalField, query));
    }
    if (hasOpenPosition) {
        store.dispatch(relatedViewResultRequest(field_suggestions_1.addTemporalField, query));
    }
    store.dispatch(relatedViewResultRequest(alternative_encodings_1.alternativeEncodings, query));
}
exports.makeRelatedViewQueries = makeRelatedViewQueries;
//# sourceMappingURL=index.js.map