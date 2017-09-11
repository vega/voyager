import {ShelfFieldDef} from './shelf/spec/encoding';

export type CustomWildcardField = {
  fields: string[];
} & Pick<ShelfFieldDef, 'type' | 'description'>;

export const DEFAULT_CUSTOM_WILDCARD_FIELDS: CustomWildcardField[] = [];
