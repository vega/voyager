import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import Form from 'react-jsonschema-form';
import {debounce} from 'throttle-debounce';
import {ActionHandler} from '../../actions';
import {SPEC_FIELD_NESTED_PROP_CHANGE, SPEC_FIELD_PROP_CHANGE, SpecEncodingAction} from '../../actions/shelf';
import {ShelfFieldDef, ShelfId} from '../../models/shelf/spec';
import * as styles from './property-editor.scss';
import {
  AXIS_ORIENT_SCHEMA, AXIS_ORIENT_UISCHEMA,
  AXIS_TITLE_SCHEMA, AXIS_TITLE_UISCHEMA,
  SCALE_TYPE_SCHEMA, SCALE_TYPE_UISCHEMA, STACK_SCHEMA, STACK_UISCHEMA,
} from './property-editorSchema';

export interface PropertyEditorProps extends ActionHandler<SpecEncodingAction> {
  prop: string;
  nestedProp: string;
  shelfId: ShelfId;
  fieldDef: ShelfFieldDef;
}

export interface PropertyEditorSchema {
  uiSchema: any;
  schema: any;
}

export class PropertyEditorBase extends React.PureComponent<PropertyEditorProps, {}> {
  private static getPropertyEditorSchema(prop: string, nestedProp: string): PropertyEditorSchema {
    if (prop === 'scale') {
      if (nestedProp === 'type') {
        return {
          schema: SCALE_TYPE_SCHEMA,
          uiSchema: SCALE_TYPE_UISCHEMA
        };
      }
    } else if (prop === 'axis') {
      if (nestedProp === 'orient') {
        return {
          schema: AXIS_ORIENT_SCHEMA,
          uiSchema: AXIS_ORIENT_UISCHEMA
        };
      } else if (nestedProp === 'title') {
        return {
          schema: AXIS_TITLE_SCHEMA,
          uiSchema: AXIS_TITLE_UISCHEMA
        };
      }
    } else if (prop === 'stack') {
      return {
        schema: STACK_SCHEMA,
        uiSchema: STACK_UISCHEMA
      };
    } else {
      return {
        schema: {},
        uiSchema: {}
      };
    }
  }

  constructor(props: PropertyEditorProps) {
    super(props);
    this.changeFieldProperty = this.changeFieldProperty.bind(this);
    this.changeFieldProperty = debounce(500, this.changeFieldProperty);
  }

  public render() {
    const {prop, nestedProp} = this.props;
    const schemaObj = PropertyEditorBase.getPropertyEditorSchema(prop, nestedProp);
    const schema = schemaObj.schema;
    const uiSchema = schemaObj.uiSchema;
    const formData = this.getFormData();
    return (
      <div styleName="property-editor">
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          onChange={this.changeFieldProperty}
        >
          <button type="submit" style={{display: 'none'}}>Submit</button>
          {/* hide required submit button */}
        </Form>
      </div>
    );
  }

  protected changeFieldProperty(result: any) {
    const {prop, nestedProp, shelfId, handleAction} = this.props;
    const value = result.formData[Object.keys(result.formData)[0]];
    if (nestedProp) {
      handleAction({
        type: SPEC_FIELD_NESTED_PROP_CHANGE,
        payload: {
          shelfId,
          prop,
          nestedProp,
          value
        }
      });
    } else {
      handleAction({
        type: SPEC_FIELD_PROP_CHANGE,
        payload: {
          shelfId,
          prop,
          value
        }
      });
    }
  }

  private getFormData() {
    const {fieldDef} = this.props;
    return {
      'scaleTypeSelect': fieldDef.scale ? fieldDef.scale.type : undefined,
      'axisTitle': fieldDef.axis ? fieldDef.axis.title : undefined,
      'orient': fieldDef.axis ? fieldDef.axis.orient : undefined,
      'stackSelect': fieldDef.stack ? fieldDef.stack : undefined
    };
  }
}

export const PropertyEditor = CSSModules(PropertyEditorBase, styles);

