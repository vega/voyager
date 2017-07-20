"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redux_undo_1 = require("redux-undo");
var vega_util_1 = require("vega-util");
var actions_1 = require("../actions");
var constants_1 = require("../constants");
var models_1 = require("../models");
var config_1 = require("../actions/config");
var actions_2 = require("../actions");
var config_2 = require("./config");
var dataset_1 = require("./dataset");
var result_1 = require("./result");
var shelf_1 = require("./shelf");
var state_1 = require("./state");
function reducer(state, action) {
    if (state === void 0) { state = models_1.DEFAULT_STATE; }
    if (action.type === actions_2.SET_APPLICATION_STATE) {
        return state_1.stateReducer(state, action);
    }
    else {
        return {
            config: config_2.configReducer(state.config, action),
            dataset: dataset_1.datasetReducer(state.dataset, action),
            shelf: shelf_1.shelfReducer(state.shelf, action, state.dataset.schema),
            result: result_1.resultReducer(state.result, action)
        };
    }
}
/**
 * Exclude these actions from the history completely.
 */
exports.ACTIONS_EXCLUDED_FROM_HISTORY = [
    // These actions are automatically re-triggered by some of the shelf components after
    // every state change. Including UNDO/REDO.
    actions_2.RESULT_RECEIVE,
    actions_2.RESULT_REQUEST,
    // These actions are not (at least at the moment) trigerrable from a user action.
    // They are either initialization options or triggered by an api call when embedding voyager.
    config_1.SET_CONFIG,
    // Undo and Redo actions will not be put in the history, but listing them here
    // allows to check that every action is put in one of these lists.
    actions_1.UNDO,
    actions_1.REDO,
    // Reset app state completely
    actions_2.SET_APPLICATION_STATE,
];
/**
 * A list of actions that can be initiated by a user.
 *
 * Each of these will start a new 'undo group'. Non-user actions will be put into the group
 * of the preceding user action if one is available. If none is available it will be put
 * into its own group.
 */
exports.USER_ACTIONS = [
    // Dataset Actions
    actions_2.DATASET_SCHEMA_CHANGE_FIELD_TYPE,
    actions_2.DATASET_SCHEMA_CHANGE_ORDINAL_DOMAIN,
    actions_2.DATASET_URL_REQUEST,
    // Filter Actions
    actions_2.FILTER_ADD,
    actions_2.FILTER_MODIFY_MAX_BOUND,
    actions_2.FILTER_MODIFY_MIN_BOUND,
    actions_2.FILTER_MODIFY_ONE_OF,
    actions_2.FILTER_REMOVE,
    // Shelf Actions,
    actions_2.SHELF_CLEAR,
    actions_2.SHELF_MARK_CHANGE_TYPE,
    actions_2.SHELF_FIELD_ADD,
    actions_2.SHELF_FIELD_AUTO_ADD,
    actions_2.SHELF_FIELD_REMOVE,
    actions_2.SHELF_FIELD_MOVE,
    actions_2.SHELF_FUNCTION_CHANGE,
    actions_2.SHELF_SPEC_LOAD,
    actions_2.SHELF_SPEC_PREVIEW,
    actions_2.SHELF_SPEC_PREVIEW_DISABLE
];
exports.USER_ACTION_INDEX = vega_util_1.toSet(exports.USER_ACTIONS);
/**
 * Actions that are to be grouped with actions that precede them.
 *
 * This list is here for documentation purposes
 *
 * DATASET_INLINE_RECEIVE,
 * DATASET_URL_RECEIVE,
 */
exports.GROUPED_ACTIONS = [
    actions_2.DATASET_INLINE_RECEIVE,
    actions_2.DATASET_URL_RECEIVE,
];
var _groupId = 0;
function getNextGroupId() {
    _groupId += 1;
    return _groupId;
}
function groupAction(action, currentState, previousHistory) {
    var currentActionType = action.type;
    if (exports.USER_ACTION_INDEX[currentActionType]) {
        var nextGroupID = currentActionType + getNextGroupId();
        return nextGroupID;
    }
    else {
        var lastGroup = previousHistory.group;
        return lastGroup;
    }
}
;
exports.rootReducer = redux_undo_1.default(reducer, {
    limit: constants_1.HISTORY_LIMIT,
    undoType: actions_1.UNDO,
    redoType: actions_1.REDO,
    groupBy: groupAction,
    filter: redux_undo_1.excludeAction(exports.ACTIONS_EXCLUDED_FROM_HISTORY),
});
