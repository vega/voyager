"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var actions_1 = require("../actions");
var index_1 = require("../models/index");
/**
 * Reducer used to set the _entire_ application state tree.
 *
 * @export
 * @param {Readonly<State>} state
 * @param {Action} action
 * @returns {Readonly<State>}
 */
function stateReducer(state, action) {
    if (state === void 0) { state = index_1.DEFAULT_STATE; }
    switch (action.type) {
        case actions_1.SET_APPLICATION_STATE:
            return action.payload.state;
    }
    return state;
}
exports.stateReducer = stateReducer;
//# sourceMappingURL=state.js.map