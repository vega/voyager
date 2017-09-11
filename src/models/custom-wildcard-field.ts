import {ExpandedType} from 'compassql/build/src/query/expandedtype';

export interface CustomWildcardField {
  fields: string[];
  wildcardDescription: string;
  type: ExpandedType;
}

export const DEFAULT_CUSTOM_WILDCARD_FIELDS: CustomWildcardField[] = [];
