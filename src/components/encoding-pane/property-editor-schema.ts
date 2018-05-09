import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Channel} from 'vega-lite/build/src/channel';
import {contains} from 'vega-lite/build/src/util';
import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';
import {ShelfFieldDef, ShelfId} from '../../models/shelf/spec';

// ------------------------------------------------------------------------------
// Schema Interfaces
// ------------------------------------------------------------------------------
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
  type: 'integer';
  title: string;
  minimum: number;
  maximum: number;
  multipleOf: number;
}

export function isStringSchema(schema: SchemaProperty): schema is StringSchema {
  return schema.type === 'string';
}

export type SchemaProperty = ObjectSchema | StringSchema | IntegerSchema;

export interface UISchema {
  [key: string]: UISchemaItem;
}

// NOTE: keys for these interfaces follow the requirement for react-jsonSchema form
// (https://mozilla-services.github.io/react-jsonschema-form/)
export interface UISchemaItem {
  'ui:widget'?: string;
  'ui:placeholder'?: string;
  'ui:emptyValue'?: string;
}

export interface PropertyEditorSchema {
  uiSchema: UISchema;
  schema: ObjectSchema;
}

// ------------------------------------------------------------------------------
// Default UISchema objects for react-jsonschema-form
// ------------------------------------------------------------------------------
const DEFAULT_TEXT_UISCHEMA: UISchemaItem = {
  'ui:emptyValue': ''
};

const DEFAULT_DISCRETE_SCALE_ARRAY_UISCHEMA: UISchemaItem = {
  ...DEFAULT_TEXT_UISCHEMA,
  'ui:placeholder': 'a, b, c, ...'
};

const DEFAULT_CONTINUOUS_SCALE_ARRAY_UISCHEMA: UISchemaItem = {
  ...DEFAULT_TEXT_UISCHEMA,
  'ui:placeholder': 'Min Number, Max Number'
};

const DEFAULT_SELECT_UISCHEMA: UISchemaItem = {
  'ui:widget': 'select',
  'ui:placeholder': 'auto',
  'ui:emptyValue': 'auto'
};

// ------------------------------------------------------------------------------
// Channel-Field Indexes for custom encoding
// Key is Tab name, value is list of fieldDef properties
// ------------------------------------------------------------------------------
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
      prop: 'axis',
      nestedProp: 'orient'
    },
    {
      prop: 'stack'
    }
  ],
};

const POSITION_FIELD_NOMINAL_INDEX = {
  'Common': [
    {
      prop: 'scale',
      nestedProp: 'type'
    },
    {
      prop: 'axis',
      nestedProp: 'orient'
    },
    {
      prop: 'axis',
      nestedProp: 'title'
    }
  ]
};

const POSITION_FIELD_TEMPORAL_INDEX = {
  'Scale': ['type'].map(p => ({prop: 'scale', nestedProp: p})),
  'Axis': ['orient', 'title'].map(p => ({prop: 'axis', nestedProp: p}))
};

const COLOR_CHANNEL_FIELD_INDEX = {
  'Common': [
    {
      prop: 'legend',
      nestedProp: 'title'
    },
    {
      prop: 'scale',
      nestedProp: 'scheme'
    }
  ],
  'Legend': ['orient', 'title', 'type'].map(p => ({prop: 'legend', nestedProp: p})),
  'Scale': ['domain', 'scheme', 'type'].map(p => ({prop: 'scale', nestedProp: p}))
};

const SIZE_CHANNEL_FIELD_INDEX = {
  'Common': [
    {
      prop: 'legend',
      nestedProp: 'title'
    },
    {
      prop: 'scale',
      nestedProp: 'type'
    }
  ],
  'Legend': ['orient', 'title'].map(p => ({prop: 'legend', nestedProp: p})),
  'Scale': ['domain', 'range', 'type'].map(p => ({prop: 'scale', nestedProp: p}))
};

const SHAPE_CHANNEL_FIELD_INDEX = {
  'Common': [
    {
      prop: 'legend',
      nestedProp: 'orient'
    },
    {
      prop: 'legend',
      nestedProp: 'title'
    },
    {
      prop: 'scale',
      nestedProp: 'domain'
    },
    {
      prop: 'scale',
      nestedProp: 'range'
    }
  ]
};

// ------------------------------------------------------------------------------
// Color Scheme Constants
// ------------------------------------------------------------------------------
export const CATEGORICAL_COLOR_SCHEMES = ['accent', 'category10', 'category20', 'category20b', 'category20c', 'dark2',
  'paired', 'pastel1', 'pastel1', 'set1', 'set2', 'set3', 'tableau10', 'tableau20'];

export const SEQUENTIAL_COLOR_SCHEMES = ['blues', 'greens', 'greys', 'purples', 'reds', 'oranges', 'viridis', 'inferno',
  'magma', 'plasma', 'bluegreen', 'bluepurple', 'greenblue', 'orangered', 'blueorange'];

// ------------------------------------------------------------------------------
// Generator/Factory Methods
// ------------------------------------------------------------------------------
export function generatePropertyEditorSchema(prop: string, nestedProp: string, propTab: string,
                                             fieldDef: ShelfFieldDef, shelfId: ShelfId): PropertyEditorSchema {
  const title = generateTitle(prop, nestedProp, propTab);
  const baseUiSchema: SchemaProperty = {
    title: title,
    type: 'string'
  };

  if (prop === 'scale') {
    if (nestedProp === 'type') {
      // Filtering based on channel type & fieldDef type
      const scaleTypes: string[] = getSupportedScaleTypes(shelfId, fieldDef);
      const schemaProperty: StringSchema = {
        ...baseUiSchema,
        enum: scaleTypes,
      };
      return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab, schemaProperty);
    } else if (nestedProp === 'scheme') {
      const schemaProperty: StringSchema = {
        ...baseUiSchema,
        enum: isContinuous(fieldDef) ? SEQUENTIAL_COLOR_SCHEMES : CATEGORICAL_COLOR_SCHEMES,
      };
      return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab, schemaProperty);
    } else if (nestedProp === 'range' || nestedProp === 'domain') {
      const schemaProperty: StringSchema = {
        ...baseUiSchema
      };
      return generateSchema(prop, nestedProp, isDiscrete(fieldDef) ?
        DEFAULT_DISCRETE_SCALE_ARRAY_UISCHEMA : DEFAULT_CONTINUOUS_SCALE_ARRAY_UISCHEMA, propTab, schemaProperty);
    }
  } else if (prop === 'axis') {
    if (nestedProp === 'orient') {
      const schemaProperty: StringSchema = {
        ...baseUiSchema,
        enum: (vlSchema as any).definitions.AxisOrient.enum,
      };
      return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab, schemaProperty);
    } else if (nestedProp === 'title') {
      const schemaProperty: StringSchema = {
        ...baseUiSchema
      };
      return generateSchema(prop, nestedProp, DEFAULT_TEXT_UISCHEMA, propTab, schemaProperty);
    }
  } else if (prop === 'stack') {
    const schemaProperty: StringSchema = {
      ...baseUiSchema,
      enum: (vlSchema as any).definitions.StackOffset.enum,
    };
    return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab, schemaProperty);
  } else if (prop === 'size') {
    const schemaProperty: StringSchema = {
      ...baseUiSchema
    };
    return generateSchema(prop, nestedProp, DEFAULT_TEXT_UISCHEMA, propTab, schemaProperty);
  } else if (prop === 'legend') {
    if (nestedProp === 'orient') {
      const schemaProperty: StringSchema = {
        ...baseUiSchema,
        enum: (vlSchema as any).definitions.LegendOrient.enum
      };
      return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab, schemaProperty);
    } else if (nestedProp === 'title') {
      const schemaProperty: StringSchema = {
        ...baseUiSchema
      };
      return generateSchema(prop, nestedProp, DEFAULT_TEXT_UISCHEMA, propTab, schemaProperty);
    } else if (nestedProp === 'type') {
      const schemaProperty: StringSchema = {
        ...baseUiSchema,
        enum: (vlSchema as any).definitions.Legend.properties.type.enum,
      };
      return generateSchema(prop, nestedProp, DEFAULT_SELECT_UISCHEMA, propTab, schemaProperty);
    }
  } else if (prop === 'format') {
    const schemaProperty: StringSchema = {
      ...baseUiSchema
    };
    return generateSchema(prop, nestedProp, DEFAULT_TEXT_UISCHEMA, propTab, schemaProperty);
  } else {
    throw new Error('Property combination not recognized');
  }
}


// TODO: Eventually refactor to Vega-Lite
function getSupportedScaleTypes(shelfId: ShelfId, fieldDef: ShelfFieldDef): string[] {
  let scaleTypes: string[] = [];
  if (contains([Channel.X, Channel.Y], shelfId.channel)) {
    if (fieldDef.type === ExpandedType.QUANTITATIVE) {
      scaleTypes = ["linear", "log", "pow", "sqrt"];
    } else if (fieldDef.type === ExpandedType.TEMPORAL) {
      scaleTypes = ["bin-linear", "time", "utc", "ordinal", "bin-ordinal", "point", "band"];
    } else if (fieldDef.type === ExpandedType.NOMINAL || fieldDef.type === ExpandedType.ORDINAL) {
      scaleTypes = ["point", "band"];
    }
  } else if (shelfId.channel === Channel.COLOR) {
    if (fieldDef.type === ExpandedType.QUANTITATIVE) {
      scaleTypes = ["linear", "pow", "sqrt", "log", "sequential"];
    } else if (fieldDef.type === ExpandedType.NOMINAL || fieldDef.type === ExpandedType.ORDINAL) {
      scaleTypes = ["ordinal", "point"];
    } else if (fieldDef.type === ExpandedType.TEMPORAL) {
      scaleTypes = ["time", "utc", "sequential"];
    }
  } else if (shelfId.channel === Channel.SIZE) {
    if (fieldDef.type === ExpandedType.QUANTITATIVE) {
      scaleTypes = ["linear", "pow", "sqrt", "log"];
    } else if (fieldDef.type === ExpandedType.NOMINAL || fieldDef.type === ExpandedType.ORDINAL) {
      scaleTypes = ["point", "band"];
    } else if (fieldDef.type === ExpandedType.TEMPORAL) {
      scaleTypes = ["bin-linear", "time", "utc", "ordinal", "bin-ordinal", "point", "band"];
    }
  }

  return scaleTypes;
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

  return {schema, uiSchema};
}

export function getFieldPropertyGroupIndex(shelfId: ShelfId, fieldDef: ShelfFieldDef) {
  if (fieldDef && (shelfId.channel === Channel.X || shelfId.channel === Channel.Y)) {
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
  } else if (shelfId.channel === Channel.COLOR) {
    return COLOR_CHANNEL_FIELD_INDEX;
  } else if (shelfId.channel === Channel.SIZE) {
    return SIZE_CHANNEL_FIELD_INDEX;
  } else if (shelfId.channel === Channel.SHAPE) {
    return SHAPE_CHANNEL_FIELD_INDEX;
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
      const fData = fieldDef[prop] ? nestedProp ? fieldDef[prop][nestedProp] : fieldDef[prop] : undefined;
      // Display empty string when '?' is passed in to retrieve default value
      // '?' is passed when formData is empty to avoid passing in empty string as a property/nestedProp value
      formData[propertyKey] = fData === '?' ? '' : fData;
    }
  }

  return formData;
}

// ------------------------------------------------------------------------------
// General-Purpose Helper Methods
// ------------------------------------------------------------------------------
export function isContinuous(fieldDef: ShelfFieldDef) {
  return contains([ExpandedType.ORDINAL, ExpandedType.TEMPORAL, ExpandedType.QUANTITATIVE], fieldDef.type);
}

export function isDiscrete(fieldDef: ShelfFieldDef) {
  return !isContinuous(fieldDef);
}

// Capitalize first letter for aesthetic purposes in form
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// Generate title for react-form with appropriate casing, prop, nestedProp
function generateTitle(prop: string, nestedProp: string, propTab: string): string {
  let title;
  if (propTab === 'Common') {
    title = nestedProp ? prop + ' ' + nestedProp : prop;
  } else {
    title = nestedProp || prop;
  }

  return toTitleCase(title);
}
