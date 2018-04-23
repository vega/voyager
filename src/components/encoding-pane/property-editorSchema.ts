import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';

export const AXIS_TITLE_SCHEMA = {
  "type": "object",
  "title": "Axis",
  "properties": {
    "axisTitle": {
      "type": "string",
      "title": "Title"
    },
  },
};

export const STACK_SCHEMA = {
  "type": "object",
  "title": "Stack",
  "properties": {
    "stackSelect": {
      "title": "Offset",
      "enum": (vlSchema as any).definitions.StackOffset.enum,
      "type": "string"
    }
  }
};

export const AXIS_ORIENT_SCHEMA = {
  "type": "object",
  "title": "Axis",
  "properties": {
    "orient": {
      "title": "Orient",
      "enum": (vlSchema as any).definitions.AxisOrient.enum,
      "type": "string"
    }
  }
};

export const SCALE_TYPE_SCHEMA = {
  "type": "object",
  "title": "Scale",
  "properties": {
    "scaleTypeSelect": {
      "title": "Type",
      "enum": (vlSchema as any).definitions.ScaleType.enum,
      "type": "string"
    },
  },
};

export const AXIS_TITLE_UISCHEMA = {
  "axisTitle": {
    "ui:autofocus": true,
    "ui:emptyValue": ""
  }
};

export const AXIS_ORIENT_UISCHEMA = {
  "orient": {
    "ui:widget": "select",
    "ui:placeholder": "auto",
    "ui:emptyValue": "auto"
  }
};

export const SCALE_TYPE_UISCHEMA = {
  "scaleTypeSelect": {
    "ui:widget": "select",
    "ui:placeholder": "auto",
    "ui:emptyValue": "auto"
  },
};

export const STACK_UISCHEMA = {
  "stackSelect": {
    "ui:widget": "select",
    "ui:placeholder": "auto",
    "ui:emptyValue": "auto"
  }
};
