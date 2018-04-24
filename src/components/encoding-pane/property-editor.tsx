import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import Form from 'react-jsonschema-form';
import {debounce} from 'throttle-debounce';
import {ActionHandler} from '../../actions';
import {SPEC_FIELD_NESTED_PROP_CHANGE, SPEC_FIELD_PROP_CHANGE, SpecEncodingAction} from '../../actions/shelf';
import {ShelfFieldDef, ShelfId} from '../../models/shelf/spec';
import {getPropertyEditorSchema} from './property-editor-schema';
import * as styles from './property-editor.scss';

export interface PropertyEditorProps extends ActionHandler<SpecEncodingAction> {
  prop: string;
  nestedProp: string;
  propTab: string;
  shelfId: ShelfId;
  fieldDef: ShelfFieldDef;
}

export class PropertyEditorBase extends React.PureComponent<PropertyEditorProps, {}> {

  constructor(props: PropertyEditorProps) {
    super(props);
    this.changeFieldProperty = this.changeFieldProperty.bind(this);
    this.changeFieldProperty = debounce(500, this.changeFieldProperty);
  }

  public render() {
    const {prop, nestedProp, propTab} = this.props;
    const {schema, uiSchema} = getPropertyEditorSchema(prop, nestedProp, propTab);
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
      'scale_type': fieldDef.scale ? fieldDef.scale.type : undefined,
      'axis_title': fieldDef.axis ? fieldDef.axis.title : undefined,
      'axis_orient': fieldDef.axis ? fieldDef.axis.orient : undefined,
      'stack': fieldDef.stack ? fieldDef.stack : undefined
    };
  }
}

export const PropertyEditor = CSSModules(PropertyEditorBase, styles);

