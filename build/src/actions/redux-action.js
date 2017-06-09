/**
 * Helpers for implementing actions with Typescript.
 */
"use strict";
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
