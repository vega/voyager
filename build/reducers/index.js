"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redux_undo_1 = require("redux-undo");
var vega_util_1 = require("vega-util");
var actions_1 = require("../actions");
var constants_1 = require("../constants");
var models_1 = require("../models");
var config_1 = require("../actions/config");
// tslint:disable-next-line:no-unused-variable
var redux_1 = require("redux");
var actions_2 = require("../actions");
var log_1 = require("../actions/log");
var reset_1 = require("../actions/reset");
var result_1 = require("../actions/result");
var shelf_preview_1 = require("../actions/shelf-preview");
var index_1 = require("../actions/shelf/index");
var spec_1 = require("../actions/shelf/spec");
var index_2 = require("../models/index");
var bookmark_1 = require("./bookmark");
var config_2 = require("./config");
var dataset_1 = require("./dataset");
var log_2 = require("./log");
var reset_2 = require("./reset");
var result_2 = require("./result");
var shelf_1 = require("./shelf");
var shelf_preview_2 = require("./shelf-preview");
var state_1 = require("./state");
/**
 * Whether to reset a particular property of the undoable state during RESET action
 */
var undoableStateToReset = {
    dataset: true,
    shelf: true,
    result: true
};
var undoableReducerBase = reset_2.makeResetReducer(function (state, action) {
    if (state === void 0) { state = index_2.DEFAULT_UNDOABLE_STATE_BASE; }
    return {
        dataset: dataset_1.datasetReducer(state.dataset, action),
        shelf: shelf_1.shelfReducer(state.shelf, action, state.dataset.schema),
        result: result_2.resultIndexReducer(state.result, action)
    };
}, undoableStateToReset, index_2.DEFAULT_UNDOABLE_STATE_BASE);
/**
 * Whether to reset a particular property of the persistent state during RESET action
 */
var persistentStateToReset = {
    bookmark: true,
    config: false,
    log: true,
    shelfPreview: true
};
var persistentReducer = reset_2.makeResetReducer(function (state, action) {
    if (state === void 0) { state = index_2.DEFAULT_PERSISTENT_STATE; }
    return {
        bookmark: bookmark_1.bookmarkReducer(state.bookmark, action),
        config: config_2.configReducer(state.config, action),
        log: log_2.logReducer(state.log, action),
        shelfPreview: shelf_preview_2.shelfPreviewReducer(state.shelfPreview, action)
    };
}, persistentStateToReset, index_2.DEFAULT_PERSISTENT_STATE);
/**
 * Exclude these actions from the history completely.
 */
exports.ACTIONS_EXCLUDED_FROM_HISTORY = [
    // Bookmark Actions
    actions_2.BOOKMARK_ADD_PLOT,
    actions_2.BOOKMARK_CLEAR_ALL,
    actions_2.BOOKMARK_MODIFY_NOTE,
    actions_2.BOOKMARK_REMOVE_PLOT,
    // Log Actions
    log_1.LOG_ERRORS_ADD,
    log_1.LOG_ERRORS_CLEAR,
    log_1.LOG_WARNINGS_ADD,
    log_1.LOG_WARNINGS_CLEAR,
    // These actions are automatically re-triggered by some of the shelf components after
    // every state change. Including UNDO/REDO.
    actions_2.RESULT_RECEIVE,
    actions_2.RESULT_REQUEST,
    // These actions are not (at least at the moment) trigerrable from a user action.
    // They are either initialization options or triggered by an api call when embedding voyager.
    config_1.SET_CONFIG,
    // Preview Action should not be a part of the undo stack
    actions_2.SHELF_PREVIEW_SPEC,
    shelf_preview_1.SHELF_PREVIEW_QUERY,
    actions_2.SHELF_PREVIEW_DISABLE,
    // Undo and Redo actions will not be put in the history, but listing them here
    // allows to check that every action is put in one of these lists.
    actions_1.UNDO,
    actions_1.REDO,
    // Reset app state completely
    reset_1.RESET,
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
    actions_2.DATASET_REQUEST,
    // Filter Actions
    actions_2.FILTER_ADD,
    actions_2.FILTER_CLEAR,
    actions_2.FILTER_MODIFY_EXTENT,
    actions_2.FILTER_MODIFY_MAX_BOUND,
    actions_2.FILTER_MODIFY_MIN_BOUND,
    actions_2.FILTER_MODIFY_ONE_OF,
    actions_2.FILTER_MODIFY_TIME_UNIT,
    actions_2.FILTER_REMOVE,
    // Result Actions,
    result_1.RESULT_LIMIT_INCREASE,
    result_1.RESULT_MODIFY_FIELD_PROP,
    result_1.RESULT_MODIFY_NESTED_FIELD_PROP,
    // Shelf Actions,
    index_1.SHELF_AUTO_ADD_COUNT_CHANGE,
    index_1.SHELF_GROUP_BY_CHANGE,
    actions_2.SHELF_LOAD_QUERY,
    actions_2.SPEC_CLEAR,
    actions_2.SPEC_MARK_CHANGE_TYPE,
    actions_2.SPEC_FIELD_ADD,
    actions_2.SPEC_FIELD_AUTO_ADD,
    actions_2.SPEC_FIELD_REMOVE,
    actions_2.SPEC_FIELD_MOVE,
    spec_1.SPEC_FIELD_PROP_CHANGE,
    spec_1.SPEC_FIELD_NESTED_PROP_CHANGE,
    actions_2.SPEC_FUNCTION_CHANGE,
    actions_2.SPEC_FUNCTION_ADD_WILDCARD,
    actions_2.SPEC_FUNCTION_DISABLE_WILDCARD,
    actions_2.SPEC_FUNCTION_ENABLE_WILDCARD,
    actions_2.SPEC_FUNCTION_REMOVE_WILDCARD,
    actions_2.SPEC_LOAD
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
    actions_2.DATASET_RECEIVE,
    actions_2.DATASET_RECEIVE,
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
var undoableReducer = redux_undo_1.default(undoableReducerBase, {
    limit: constants_1.HISTORY_LIMIT,
    undoType: actions_1.UNDO,
    redoType: actions_1.REDO,
    groupBy: groupAction,
    filter: redux_undo_1.excludeAction(exports.ACTIONS_EXCLUDED_FROM_HISTORY),
});
var rootBase = redux_1.combineReducers({
    persistent: persistentReducer,
    undoable: undoableReducer
});
function rootReducer(state, action) {
    if (state === void 0) { state = models_1.DEFAULT_STATE; }
    if (action.type === actions_2.SET_APPLICATION_STATE) {
        return state_1.stateReducer(state, action);
    }
    else {
        return rootBase(state, action);
    }
}
exports.rootReducer = rootReducer;
//# sourceMappingURL=index.js.map