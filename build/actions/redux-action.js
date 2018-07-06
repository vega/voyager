"use strict";
/**
 * Helpers for implementing actions with Typescript.
 */
Object.defineProperty(exports, "__esModule", { value: true });
;
;
/**
 * Create a handleAction object
 */
function createDispatchHandler() {
    return function (dispatch) { return ({
        handleAction: function (action) {
            // HACK: typing here is somewhat wrong -- we should remove any
            dispatch(action);
        }
    }); };
}
exports.createDispatchHandler = createDispatchHandler;
//# sourceMappingURL=redux-action.js.map