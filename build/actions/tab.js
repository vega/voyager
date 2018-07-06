"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAB_ACTION_TYPE_INDEX = {
    TAB_ADD: 1,
    TAB_REMOVE: 1,
    TAB_SWITCH: 1,
    TAB_TITLE_UPDATE: 1
};
function isTabAction(action) {
    return exports.TAB_ACTION_TYPE_INDEX[action.type];
}
exports.isTabAction = isTabAction;
exports.TAB_ADD = 'TAB_ADD';
exports.TAB_REMOVE = 'TAB_REMOVE';
exports.TAB_SWITCH = 'TAB_SWITCH';
exports.TAB_TITLE_UPDATE = 'TAB_TITLE_UPDATE';
//# sourceMappingURL=tab.js.map