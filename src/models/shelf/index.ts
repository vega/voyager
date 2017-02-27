import {ShelfUnitSpec, DEFAULT_SHELF_UNIT_SPEC, toSpecQuery} from './spec';
import {Query} from 'compassql/build/src/query/query';

export * from './encoding';
export * from './spec';
export const DEFAULT_SHELF_SPEC: Readonly<Shelf> = {
  spec: DEFAULT_SHELF_UNIT_SPEC
};

export interface Shelf {
  spec: ShelfUnitSpec; // TODO: support other type of specs.

  // TODO: support groupBy, autoCount, orderBy
}

export function toQuery(shelf: Shelf): Query {
  return {
    spec: toSpecQuery(shelf.spec)
  };
}
