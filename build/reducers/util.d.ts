/**
 * Immutable array splice
 */
export declare function removeItemFromArray(array: ReadonlyArray<any>, index: number): {
    item: any;
    array: any[];
};
export declare function insertItemToArray<T>(array: ReadonlyArray<T>, index: number, item: T): T[];
export declare function modifyItemInArray<T>(array: ReadonlyArray<T>, index: number, modifier: (t: Readonly<T>) => T): T[];
