import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import {Channel} from 'vega-lite/build/src/channel';
import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';
import {ShelfFieldDef} from '../../../build/models/shelf/spec/encoding';
import {ShelfId} from '../../models/shelf/spec';
import {CustomProp} from '../../../build/components/encoding-pane/field-customizer';

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
  asix_orient?: NestedSchemaProperty;
  axis_title?: NestedSchemaProperty;
  scale_type?: NestedSchemaProperty;
  stack?: NestedSchemaProperty;
}

// TODO: Rename to camelCase
export interface UISchema {
  asix_orient?: UISchemaContext;
  axis_title?: UISchemaContext;
  scale_type?: UISchemaContext;
  stack?: UISchemaContext;
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
  'ui:autofocus': true,
  'ui:emptyValue': ''
};

const DEFAULT_SELECT_UISCHEMA: UISchemaContext = {
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
  'Scale': [
    {
      prop: 'scale',
      nestedProp: 'type'
    }
  ],
  'Axis': [
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

const POSITION_FIELD_NOMINAL_INDEX = {
  'Scale': [
    {
      prop: 'scale',
      nestedProp: 'type'
    }
  ],
  'Axis': [
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
  'Scale': [
    {
      prop: 'scale',
      nestedProp: 'type'
    }
  ],
  'Axis': [
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
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// TODO: change naming convention to camelCase
/*
*  NOTE: factory method where propertyKey follows naming convention: Capitalized Prop + Capitalized NestedProp
*  Example: {prop: axis, nestedProp: orient} translates to "AxisOrient"
*/
function generateSchema(prop: string, nestedProp: string, uiSchemaContext: UISchemaContext, propTab: string,
                        schemaEnum?: string[]): PropertyEditorSchema {
  // prop = capitalizeFirstLetter(prop);
  // nestedProp = nestedProp ? capitalizeFirstLetter(nestedProp) : nestedProp;
  const propertyKey = nestedProp ? prop + '_' + nestedProp : prop;
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
        "title": toTitleCase(title),
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

