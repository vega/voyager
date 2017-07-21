/**
 * Immutable array splice
 */
export function removeItemFromArray(array: ReadonlyArray<any>, index: number) {
  return {
    item: array[index],
    array: [
      ...array.slice(0, index),
      ...array.slice(index + 1)
    ]
  };
}

export function insertItemToArray<T>(array: ReadonlyArray<T>, index: number, item: T) {
  return [
    ...array.slice(0, index),
    item,
    ...array.slice(index)
  ];
}

export function modifyItemInArray<T>(array: ReadonlyArray<T>, index: number, modifier: (t: Readonly<T>) => T) {
  return [
    ...array.slice(0, index),
    modifier(array[index]),
    ...array.slice(index + 1)
  ];
}
