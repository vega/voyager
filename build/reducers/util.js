"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Immutable array splice
 */
function removeItemFromArray(array, index) {
    return {
        item: array[index],
        array: array.slice(0, index).concat(array.slice(index + 1))
    };
}
exports.removeItemFromArray = removeItemFromArray;
function insertItemToArray(array, index, item) {
    return array.slice(0, index).concat([
        item
    ], array.slice(index));
}
exports.insertItemToArray = insertItemToArray;
function modifyItemInArray(array, index, modifier) {
    return array.slice(0, index).concat([
        modifier(array[index])
    ], array.slice(index + 1));
}
exports.modifyItemInArray = modifyItemInArray;
//# sourceMappingURL=util.js.map