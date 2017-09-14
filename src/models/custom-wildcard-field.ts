import {Wildcard} from 'compassql/build/src/wildcard';
import {ShelfFieldDef} from './shelf/spec/encoding';

export type CustomWildcardFieldDef = {
  field: Wildcard<string>;
} & Pick<ShelfFieldDef, 'type' | 'description'>;

export const DEFAULT_CUSTOM_WILDCARD_FIELDDEFS: CustomWildcardFieldDef[] = [];
