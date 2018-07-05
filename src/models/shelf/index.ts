import {Query} from 'compassql/build/src/query/query';
import {isString} from 'vega-util';
import {ShelfFilter} from './filter';
import {ShelfFieldDef, toFieldQuery} from './spec';
import {DEFAULT_SHELF_UNIT_SPEC, hasWildcards, ShelfUnitSpec, toSpecQuery} from './spec';

export * from './spec';
export * from './filter';

export const DEFAULT_SHELF: Readonly<Shelf> = {
  spec: DEFAULT_SHELF_UNIT_SPEC,
  filters: [],
  groupBy: 'auto',
  autoAddCount: true
};

export type ShelfGroupBy = 'auto' | 'field' | 'fieldTransform' | 'encoding';

const SHELF_GROUP_BY_INDEX: {[K in ShelfGroupBy]: 1} = {
  auto: 1,
  field: 1,
  fieldTransform: 1,
  encoding: 1
};

export const SHELF_GROUP_BYS = Object.keys(SHELF_GROUP_BY_INDEX) as ShelfGroupBy[];

export function isShelfGroupBy(s: any): s is ShelfGroupBy {
  return isString(s) && SHELF_GROUP_BY_INDEX[s];
}

export interface Shelf {
  spec: ShelfUnitSpec; // TODO: support other type of specs.

  filters: ShelfFilter[];

  // TODO: support orderBy

  groupBy: ShelfGroupBy;

  autoAddCount: boolean;
}

export const DEFAULT_ORDER_BY = ['fieldOrder', 'aggregationQuality', 'effectiveness'];
export const DEFAULT_CHOOSE_BY = ['aggregationQuality', 'effectiveness'];

export function toQuery(params: {spec: ShelfUnitSpec, autoAddCount: boolean, groupBy: ShelfGroupBy}): Query {
  const {spec, autoAddCount} = params;
  const specQ = toSpecQuery(spec);
  const {hasAnyWildcard, hasWildcardFn, hasWildcardField} = hasWildcards(specQ);

  const groupBy = params.groupBy !== 'auto' ? params.groupBy :
    getDefaultGroupBy({hasWildcardFn, hasWildcardField});

  return {
    spec: specQ,
    groupBy,
    orderBy: DEFAULT_ORDER_BY,
    chooseBy: DEFAULT_CHOOSE_BY,
    ...(hasAnyWildcard ? {config: {autoAddCount}} : {})
  };
}

export function getDefaultGroupBy(args: {hasWildcardField: boolean, hasWildcardFn: boolean}) {
  const {hasWildcardFn, hasWildcardField} = args;

  return hasWildcardFn ? 'fieldTransform' :
    hasWildcardField ? 'field' :
    'encoding';
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
