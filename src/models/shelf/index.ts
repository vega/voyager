
import {Query} from 'compassql/build/src/query/query';
import {ShelfFieldDef, toFieldQuery} from './spec';
import {DEFAULT_SHELF_UNIT_SPEC, hasWildcards, ShelfUnitSpec, toSpecQuery} from './spec';

export * from './spec';

export const DEFAULT_SHELF: Readonly<Shelf> = {
  spec: DEFAULT_SHELF_UNIT_SPEC,
  autoAddCount: true
};

export interface Shelf {
  spec: ShelfUnitSpec; // TODO: support other type of specs.
  // TODO: support groupBy, autoCount, orderBy

  autoAddCount: boolean;
}

export const DEFAULT_ORDER_BY = ['fieldOrder', 'aggregationQuality', 'effectiveness'];
export const DEFAULT_CHOOSE_BY = ['aggregationQuality', 'effectiveness'];

export function toQuery(shelf: Shelf): Query {
  const {spec, autoAddCount} = shelf;
  const specQ = toSpecQuery(spec);
  const {hasWildcardField, hasWildcardFn, hasAnyWildcard} = hasWildcards(specQ);
  // TODO: support custom groupBy
  const groupBy = hasWildcardFn ? 'fieldTransform' :
    hasWildcardField ? 'field' :
    'encoding';

  return {
    spec: specQ,
    groupBy: groupBy,
    orderBy: DEFAULT_ORDER_BY,
    chooseBy: DEFAULT_CHOOSE_BY,
    ...(hasAnyWildcard ? {config: {autoAddCount}} : {})
  };
}

export function autoAddFieldQuery(shelf: ShelfUnitSpec, fieldDef: ShelfFieldDef): Query {
  const spec = toSpecQuery(shelf);

  spec.encodings.push(toFieldQuery(fieldDef, '?'));
  return {
    spec,
    chooseBy: 'effectiveness'
    // TODO: customizable config
  };
}
