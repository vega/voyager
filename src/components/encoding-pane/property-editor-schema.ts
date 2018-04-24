import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';

// NOTE: keys for these interfaces follow the requirement for react-jsonSchema form
// (https://mozilla-services.github.io/react-jsonschema-form/)
export interface SchemaFormat {
  type: string;
  title?: string;
  properties: SchemaProperty;
}

// NOTE: keys for these interfaces follow the requirement for react-jsonSchema form
// (https://mozilla-services.github.io/react-jsonschema-form/)
export interface NestedSchemaProperty {
  type: string;
  title: string;
  'enum'?: string[];
}

export interface SchemaProperty {
  AxisOrient?: NestedSchemaProperty;
  AxisTitle?: NestedSchemaProperty;
  ScaleType?: NestedSchemaProperty;
  Stack?: NestedSchemaProperty;
}

// TODO: Rename to camelCase
export interface UISchema {
  AxisOrient?: UISchemaContext;
  AxisTitle?: UISchemaContext;
  ScaleType?: UISchemaContext;
  Stack?: UISchemaContext;
}

// NOTE: keys for these interfaces follow the requirement for react-jsonSchema form
// (https://mozilla-services.github.io/react-jsonschema-form/)
export interface UISchemaContext {
  'ui:autofocus'?: boolean;
  'ui:widget'?: string;
  'ui:placeholder'?: string;
  'ui:emptyValue'?: string;
}

const DEFAULT_TEXT_UISCHEMA: UISchemaContext = {
  "ui:autofocus": true,
  "ui:emptyValue": ""
};

const DEFAULT_SELECT_UISCHEMA: UISchemaContext = {
  "ui:widget": "select",
  "ui:placeholder": "auto",
  "ui:emptyValue": "auto"
};

export interface PropertyEditorSchema {
  uiSchema: UISchema;
  schema: SchemaFormat;
}

export function getPropertyEditorSchema(prop: string, nestedProp: string, propTab: string): PropertyEditorSchema {
  if (prop === 'scale') {
    if (nestedProp === 'type') {
      return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab,
        (vlSchema as any).definitions.ScaleType.enum);
    }
  } else if (prop === 'axis') {
    if (nestedProp === 'orient') {
      return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab,
        (vlSchema as any).definitions.AxisOrient.enum);
    } else if (nestedProp === 'title') {
      return generateSchema(prop, nestedProp, DEFAULT_TEXT_UISCHEMA, propTab);
    }
  } else if (prop === 'stack') {
    return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab,
      (vlSchema as any).definitions.StackOffset.enum);
  } else {
    return {
      schema: undefined,
      uiSchema: undefined
    };
  }
}

// Capitalize first letter for aesthetic purposes in form
function capitalizeFirstLetter(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// TODO: change naming convention to camelCase
/*
*  NOTE: factory method where propertyKey follows naming convention: Capitalized Prop + Capitalized NestedProp
*  Example: {prop: axis, nestedProp: orient} translates to "AxisOrient"
*/
function generateSchema(prop: string, nestedProp: string, uiSchemaContext: UISchemaContext, propTab: string,
                        schemaEnum?: string[]): PropertyEditorSchema {
  prop = capitalizeFirstLetter(prop);
  nestedProp = nestedProp ? capitalizeFirstLetter(nestedProp) : nestedProp;
  const propertyKey = nestedProp ? prop + nestedProp : prop;
  let title;
  if (propTab === 'Common') {
    title = nestedProp ? prop + ' ' + nestedProp : prop;
  } else {
    title = nestedProp || prop;
  }
  const schema: SchemaFormat = {
    type: "object",
    properties: {
      [propertyKey]: {
        "type": "string",
        "title": title,
        ...(schemaEnum ? {enum: schemaEnum} : {})
      }
    }
  };
  const uiSchema: UISchema = {
    [propertyKey]: uiSchemaContext
  };
  return {
    schema: schema,
    uiSchema: uiSchema
  };
}

