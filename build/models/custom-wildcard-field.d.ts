import { ShelfFieldDef } from './shelf/spec/encoding';
export declare type CustomWildcardField = {
    fields: string[];
} & Pick<ShelfFieldDef, 'type' | 'description'>;
export declare const DEFAULT_CUSTOM_WILDCARD_FIELDS: CustomWildcardField[];
