import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Channel} from 'vega-lite/build/src/channel';
import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';
import {ShelfFieldDef, ShelfId} from '../../models/shelf/spec';

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
}

export function isStringSchema(schema: SchemaProperty): schema is StringSchema {
  return schema.type === 'string';
}

export type SchemaProperty = ObjectSchema | StringSchema;

export interface UISchema {
  [key: string]: UISchemaItem;
}

// NOTE: keys for these interfaces follow the requirement for react-jsonSchema form
// (https://mozilla-services.github.io/react-jsonschema-form/)
export interface UISchemaItem {
  'ui:autofocus'?: boolean;
  'ui:widget'?: string;
  'ui:placeholder'?: string;
  'ui:emptyValue'?: string;
}

export interface PropertyEditorSchema {
  uiSchema: UISchema;
  schema: ObjectSchema;
}

const DEFAULT_TEXT_UISCHEMA: UISchemaItem = {
  'ui:autofocus': true,
  'ui:emptyValue': ''
};

const DEFAULT_SELECT_UISCHEMA: UISchemaItem = {
  'ui:widget': 'select',
  'ui:placeholder': 'auto',
  'ui:emptyValue': 'auto'
};

const POSITION_FIELD_QUANTITATIVE_INDEX = {
  'Common': [
    {
      prop: 'scale',
      nestedProp: 'type'
    },
    {
      prop: 'axis',
      nestedProp: 'title'
    },
    {
      prop: 'stack'
    }
  ],
  'Scale': ['type'].map(p => ({prop: 'scale', nestedProp: p})),
  'Axis': ['orient', 'title'].map(p => ({prop: 'axis', nestedProp: p}))
};

const POSITION_FIELD_NOMINAL_INDEX = {
  'Scale': ['type'].map(p => ({prop: 'scale', nestedProp: p})),
  'Axis': ['orient', 'title'].map(p => ({prop: 'axis', nestedProp: p}))
};

const POSITION_FIELD_TEMPORAL_INDEX = {
  'Scale': ['type'].map(p => ({prop: 'scale', nestedProp: p})),
  'Axis': ['orient', 'title'].map(p => ({prop: 'axis', nestedProp: p}))
};

// Capitalize first letter for aesthetic purposes in form
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function generateTitle(prop: string, nestedProp: string, propTab: string): string {
  let title;
  if (propTab === 'Common') {
    title = nestedProp ? prop + ' ' + nestedProp : prop;
  } else {
    title = nestedProp || prop;
  }

  return toTitleCase(title);
}

export function getPropertyEditorSchema(prop: string, nestedProp: string, propTab: string): PropertyEditorSchema {
  const title = generateTitle(prop, nestedProp, propTab);
  const baseSchemaProp = {
    title: title
  };
  if (prop === 'scale') {
    if (nestedProp === 'type') {
      const schemaProperty: StringSchema = {
        ...baseSchemaProp as StringSchema,
        enum: (vlSchema as any).definitions.ScaleType.enum,
        type: 'string'
      };
      return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab, schemaProperty);
    }
  } else if (prop === 'axis') {
    if (nestedProp === 'orient') {
      const schemaProperty: StringSchema = {
        ...baseSchemaProp as StringSchema,
        enum: (vlSchema as any).definitions.AxisOrient.enum,
        type: 'string'
      };
      return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab, schemaProperty);
    } else if (nestedProp === 'title') {
      const schemaProperty: StringSchema = {
        ...baseSchemaProp as StringSchema,
        type: 'string'
      };
      return generateSchema(prop, nestedProp, DEFAULT_TEXT_UISCHEMA, propTab, schemaProperty);
    }
  } else if (prop === 'stack') {
    const schemaProperty: StringSchema = {
      ...baseSchemaProp as StringSchema,
      enum: (vlSchema as any).definitions.StackOffset.enum,
      type: 'string'
    };
    return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab, schemaProperty);
  } else {
    throw new Error('Property combination not recognized');
  }
}


/*
*  NOTE: factory method where propertyKey follows naming convention: prop_nestedProp
*  Example: {prop: axis, nestedProp: orient} translates to "axis_orient"
*/
function generateSchema(prop: string, nestedProp: string, uiSchemaItem: UISchemaItem, propTab: string,
                        schemaProp: SchemaProperty): PropertyEditorSchema {
  const propertyKey = nestedProp ? prop + '_' + nestedProp : prop;
  const schema: ObjectSchema = {
    type: 'object',
    properties: {
      [propertyKey]: schemaProp
    }
  };
  const uiSchema: UISchema = {
    [propertyKey]: uiSchemaItem
  };

  return {
    schema: schema,
    uiSchema: uiSchema
  };
}

export function getFieldPropertyGroupIndex(shelfId: ShelfId, fieldDef: ShelfFieldDef) {
  if (shelfId.channel === Channel.X || shelfId.channel === Channel.Y) {
    switch (fieldDef.type) {
      case ExpandedType.QUANTITATIVE:
        return POSITION_FIELD_QUANTITATIVE_INDEX;
      case ExpandedType.ORDINAL:
        return POSITION_FIELD_NOMINAL_INDEX;
      case ExpandedType.NOMINAL:
        return POSITION_FIELD_NOMINAL_INDEX;
      case ExpandedType.TEMPORAL:
        return POSITION_FIELD_TEMPORAL_INDEX;
    }
  }
}

export function generateFormData(shelfId: ShelfId, fieldDef: ShelfFieldDef) {
  const index = getFieldPropertyGroupIndex(shelfId, fieldDef);
  const formData = {};
  for (const key of Object.keys(index)) {
    for (const customProp of index[key]) {
      const prop = customProp.prop;
      const nestedProp = customProp.nestedProp;
      const propertyKey = nestedProp ? prop + '_' + nestedProp : prop;
      formData[propertyKey] = fieldDef[prop] ? nestedProp ? fieldDef[prop][nestedProp] : fieldDef[prop] : undefined;
    }
  }

  return formData;
}
