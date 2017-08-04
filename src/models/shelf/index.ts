
import {Query} from 'compassql/build/src/query/query';
import {ShelfFieldDef, toFieldQuery} from './encoding';
import {DEFAULT_SHELF_UNIT_SPEC, hasWildcards, ShelfUnitSpec, toSpecQuery} from './spec';

export * from './encoding';
export * from './spec';
export const DEFAULT_SHELF_SPEC: Readonly<Shelf> = {
  spec: DEFAULT_SHELF_UNIT_SPEC
};

export interface Shelf {
  spec: ShelfUnitSpec; // TODO: support other type of specs.
  // TODO: support groupBy, autoCount, orderBy
}

export const DEFAULT_ORDER_BY = ['fieldOrder', 'aggregationQuality', 'effectiveness'];
export const DEFAULT_CHOOSE_BY = ['aggregationQuality', 'effectiveness'];

export function toQuery(shelf: Shelf): Query {
  const spec = toSpecQuery(shelf.spec);
  const {hasWildcardField, hasWildcardFn, hasWildcardChannel} = hasWildcards(spec);

  // TODO: support custom groupBy
  const groupBy = hasWildcardFn ? 'fieldTransform' :
    hasWildcardField ? 'field' :
    'encoding';

  return {
    spec: spec,
    groupBy: groupBy,
    orderBy: DEFAULT_ORDER_BY,
    chooseBy: DEFAULT_CHOOSE_BY,
    config: {
      // TODO: support customAutoAddCount
      autoAddCount: (hasWildcardField || hasWildcardFn || hasWildcardChannel)
    }
  };
}

export function autoAddFieldQuery(shelf: ShelfUnitSpec, fieldDef: ShelfFieldDef): Query {
  const spec = toSpecQuery(shelf);

  spec.encodings.push(toFieldQuery(fieldDef));
  return {
    spec,
    chooseBy: 'effectiveness'
    // TODO: customizable config
  };
}
