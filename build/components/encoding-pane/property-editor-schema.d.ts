import { Channel } from 'vega-lite/build/src/channel';
import { ShelfFieldDef, ShelfId } from '../../models/shelf/spec';
export interface SchemaProperties {
    [key: string]: SchemaProperty;
}
export interface ObjectSchema {
    type: 'object';
    title?: string;
    properties: SchemaProperties;
}
export interface StringSchema {
    type: 'string';
    title: string;
    enum?: string[];
    default?: string;
}
export interface IntegerSchema {
    type: 'number';
    title: string;
    minimum: number;
    maximum: number;
    multipleOf: number;
}
export declare function isStringSchema(schema: SchemaProperty): schema is StringSchema;
export declare type SchemaProperty = ObjectSchema | StringSchema | IntegerSchema;
export interface UISchema {
    [key: string]: UISchemaItem;
}
export interface UISchemaItem {
    'ui:widget'?: string;
    'ui:placeholder'?: string;
    'ui:emptyValue'?: string;
}
export interface PropertyEditorSchema {
    uiSchema: UISchema;
    schema: ObjectSchema;
}
export declare const CATEGORICAL_COLOR_SCHEMES: string[];
export declare const SEQUENTIAL_COLOR_SCHEMES: string[];
export declare function generatePropertyEditorSchema(prop: string, nestedProp: string, propTab: string, fieldDef: ShelfFieldDef, channel: Channel): PropertyEditorSchema;
export declare function getFieldPropertyGroupIndex(shelfId: ShelfId, fieldDef: ShelfFieldDef): {
    'Common': {
        prop: string;
    }[];
} | {
    'Legend': {
        prop: string;
        nestedProp: string;
    }[];
    'Scale': {
        prop: string;
        nestedProp: string;
    }[];
};
export declare function generateFormData(shelfId: ShelfId, fieldDef: ShelfFieldDef): {};
export declare function isContinuous(fieldDef: ShelfFieldDef): boolean;
export declare function isDiscrete(fieldDef: ShelfFieldDef): boolean;
