import {isValueQuery} from 'compassql/build/src/query/encoding';
import {Query} from 'compassql/build/src/query/query';
import {isWildcard, SHORT_WILDCARD} from 'compassql/build/src/wildcard';

import {ShelfFieldDef} from './encoding';
import {DEFAULT_SHELF_UNIT_SPEC, ShelfUnitSpec, toSpecQuery} from './spec';

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

  let hasWildcardField = false, hasWildcardFn = false, hasWildcardChannel = false;
  for (const encQ of spec.encodings) {
    if (isValueQuery(encQ)) {
      continue;
    }
    if (encQ.autoCount === false) {
      continue;
    }

    if (isWildcard(encQ.field)) {
      hasWildcardField = true;
    }

    if ((encQ.aggregate) ||
        (encQ.bin) ||
        (encQ.timeUnit)) {
      hasWildcardFn = true;
    }

    if (isWildcard(encQ.channel)) {
      hasWildcardChannel = true;
    }
  }

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

export function autoAddFieldQuery(shelf: ShelfUnitSpec, fieldDef: ShelfFieldDef) {
  const spec = toSpecQuery(shelf);
  spec.encodings.push({
    channel: SHORT_WILDCARD,
    ...fieldDef
  });

  return {
    spec,
    chooseBy: 'effectiveness'
    // TODO: customizable config
  };
}
