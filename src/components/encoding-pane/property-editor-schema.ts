import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Axis} from 'vega-lite/build/src/axis';
import {Channel} from 'vega-lite/build/src/channel';
import {Legend} from 'vega-lite/build/src/legend';
import {Scale} from 'vega-lite/build/src/scale';
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
  type: 'number';
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

// Currently supported customizble encoding channels that display caret in customizer UI
export const CUSTOMIZABLE_ENCODING_CHANNELS = [Channel.X, Channel.Y, Channel.COLOR, Channel.SIZE, Channel.SHAPE];

// ------------------------------------------------------------------------------
// Channel-Field Indexes for custom encoding
// Key is Tab name, value is list of fieldDef properties
// ------------------------------------------------------------------------------

const AXIS_ORIENT_TITLE = ['title', 'orient'].map(p => ({prop: 'axis', nestedProp: p}));
const LEGEND_ORIENT_TITLE = ['orient', 'title'].map(p => ({prop: 'legend', nestedProp: p}));

const POSITION_FIELD_NOMINAL_INDEX = {
  'Common': [
    {
      prop: 'scale',
      nestedProp: 'type'
    },
    ...AXIS_ORIENT_TITLE
  ]
};

const POSITION_FIELD_TEMPORAL_INDEX = POSITION_FIELD_NOMINAL_INDEX;

const POSITION_FIELD_QUANTITATIVE_INDEX = {
  'Common': [
    ...POSITION_FIELD_NOMINAL_INDEX.Common,
    {prop: 'stack'}
  ]
};

const COLOR_CHANNEL_FIELD_INDEX = {
  'Legend': ['orient', 'title', 'type'].map(p => ({prop: 'legend', nestedProp: p})),
  'Scale': ['type', 'domain', 'scheme'].map(p => ({prop: 'scale', nestedProp: p}))
};

const SIZE_CHANNEL_FIELD_INDEX = {
  'Legend': ['orient', 'title'].map(p => ({prop: 'legend', nestedProp: p})),
  'Scale': ['type', 'domain', 'range'].map(p => ({prop: 'scale', nestedProp: p}))
};

const SHAPE_CHANNEL_FIELD_INDEX = {
  'Legend': LEGEND_ORIENT_TITLE,
  'Scale': ['domain', 'range'].map(p => ({prop: 'scale', nestedProp: p}))
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
                                             fieldDef: ShelfFieldDef, channel: Channel): PropertyEditorSchema {
  const title = generateTitle(prop, nestedProp, propTab);
  const propertyKey = nestedProp ? prop + '_' + nestedProp : prop;
  switch (prop) {
    case 'scale':
      const scaleTypes: string[] = getSupportedScaleTypes(channel, fieldDef);
      return generateScaleEditorSchema(nestedProp as keyof Scale, scaleTypes, fieldDef, title, propertyKey);

    case 'axis':
      return generateAxisEditorSchema(nestedProp as keyof Axis, channel, title, propertyKey);

    case 'stack':
      return generateSelectSchema('stack', (vlSchema as any).definitions.StackOffset.enum, title);

    case 'legend':
      return generateLegendEditorSchema(nestedProp as keyof Legend, title, propertyKey);

    case 'format':
      return generateTextBoxSchema('format', '', title, 'string');

    default:
      throw new Error('Property combination not recognized');
  }
}

function generateLegendEditorSchema(legendProp: keyof Legend, title: string, propertyKey: string) {
  switch (legendProp) {
    case 'orient':
      return generateSelectSchema(propertyKey, (vlSchema as any).definitions.LegendOrient.enum, title);

    case 'title':
      return generateTextBoxSchema(propertyKey, '', title, 'string');

    case 'type':
      return generateSelectSchema(propertyKey, (vlSchema as any).definitions.Legend.properties.type.enum, title);

    default:
      throw new Error('Property combination not recognized');
  }
}

function generateAxisEditorSchema(axisProp: keyof Axis, channel: Channel, title: string, propertyKey: string) {
  switch (axisProp) {
    case 'orient':
      return generateSelectSchema(propertyKey, channel === 'y' ? ['left', 'right'] : ['top', 'bottom'], title);

    case 'title':
      return generateTextBoxSchema(propertyKey, '', title, 'string');

    default:
      throw new Error('Property combination not recognized');
  }
}

function generateScaleEditorSchema(scaleProp: keyof Scale, scaleTypes: string[], fieldDef: ShelfFieldDef,
                                   title: string, propertyKey: string) {
  switch (scaleProp) {
    case 'type':
      return generateSelectSchema(propertyKey, scaleTypes, title);

    case 'scheme':
      return generateSelectSchema(propertyKey, isContinuous(fieldDef) ? SEQUENTIAL_COLOR_SCHEMES :
        CATEGORICAL_COLOR_SCHEMES, title);

    case 'range':
    case 'domain':
      return generateTextBoxSchema(propertyKey, isDiscrete(fieldDef) ?
        'a, b, c, ...' : 'Min Number, Max Number', title, 'string');

    default:
      throw new Error('Provided property is not supported');
  }
}

// TODO: Eventually refactor to Vega-Lite
function getSupportedScaleTypes(channel: Channel, fieldDef: ShelfFieldDef): string[] {
  switch (fieldDef.type) {
    case ExpandedType.QUANTITATIVE:
      if (contains([Channel.X, Channel.Y], channel)) {
        return ["linear", "log", "pow", "sqrt"];
      } else if (channel === Channel.COLOR) {
        return ["linear", "pow", "sqrt", "log", "sequential"];
      } else if (channel === Channel.SIZE) {
        return ["linear", "pow", "sqrt", "log"];
      } else {
        return [];
      }

    case ExpandedType.ORDINAL:
    case ExpandedType.NOMINAL:
      if (contains([Channel.X, Channel.Y], channel)) {
        return ["point", "band"];
      } else if (channel === Channel.COLOR) {
        return ["ordinal"];
      } else if (channel === Channel.SIZE) {
        return ["point", "band"];
      } else {
        return [];
      }

    case ExpandedType.TEMPORAL:
      if (contains([Channel.X, Channel.Y], channel)) {
        return ["time", "utc"];
      } else if (channel === Channel.COLOR) {
        return ["time", "utc", "sequential"];
      } else if (channel === Channel.SIZE) {
        return ["time", "utc"];
      } else {
        return [];
      }

    default:
      return [];
  }
}

function generateSelectSchema(propertyKey: string, enumVals: string[], title: string) {
  const schema: ObjectSchema = {
    type: 'object',
    properties: {
      [propertyKey]: {
        type: 'string',
        title: title,
        enum: enumVals
      }
    }
  };

  const uiSchema: UISchema = {
    [propertyKey]: {
      'ui:widget': 'select',
      'ui:placeholder': 'auto',
      'ui:emptyValue': 'auto'
    }
  };

  return {schema, uiSchema};
}

function generateTextBoxSchema(propKey: string, placeHolderText: string, title: string,
                               primitiveType: 'string' | 'number') {
  const schema: ObjectSchema = {
    type: 'object',
    properties: {
      [propKey]: {
        title: title,
        type: primitiveType
      } as SchemaProperty
    }
  };
  const uiSchema: UISchema = {
    [propKey]: {
      'ui:emptyValue': '',
      'ui:placeholder': placeHolderText
    }
  };

  return {schema, uiSchema};
}

export function getFieldPropertyGroupIndex(shelfId: ShelfId, fieldDef: ShelfFieldDef) {
  if (fieldDef && (shelfId.channel === Channel.X || shelfId.channel === Channel.Y)) {
    switch (fieldDef.type) {
      case ExpandedType.QUANTITATIVE:
        if (!isContinuous(fieldDef)) {
          return POSITION_FIELD_QUANTITATIVE_INDEX.Common.filter(t => {
            return t.prop !== "stack";
          });
        }
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
  const formDataIndex = {};
  for (const key of Object.keys(index)) {
    for (const customProp of index[key]) {
      const prop = customProp.prop;
      const nestedProp = customProp.nestedProp;
      const propertyKey = nestedProp ? prop + '_' + nestedProp : prop;
      const formData = fieldDef[prop] ? nestedProp ? fieldDef[prop][nestedProp] : fieldDef[prop] : undefined;
      // Display empty string when '?' is passed in to retrieve default value
      // '?' is passed when formData is empty to avoid passing in empty string as a property/nestedProp value
      formDataIndex[propertyKey] = formData === undefined ? '' : formData;
    }
  }

  return formDataIndex;
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
