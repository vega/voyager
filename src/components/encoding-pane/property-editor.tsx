import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import Form from 'react-jsonschema-form';
import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';
import {ActionHandler} from '../../actions/redux-action';
import {SPEC_FIELD_NESTED_PROP_CHANGE, SpecEncodingAction} from '../../actions/shelf/spec';
import {ShelfFieldDef, ShelfId} from '../../models/shelf/spec/encoding';
import * as styles from './property-editor.scss';

export interface PropertyEditorProps extends ActionHandler<SpecEncodingAction> {
  prop: string;
  nestedProp: string;
  shelfId: ShelfId;
  fieldDef: ShelfFieldDef;
}

export class PropertyEditorBase extends React.PureComponent<PropertyEditorProps, {}> {
  constructor(props: PropertyEditorProps) {
    super(props);
    this.changeFieldProperty = this.changeFieldProperty.bind(this);
  }

  public render() {
    const {prop, nestedProp, fieldDef} = this.props;
    const uiSchema = {
      "ui:title": `${prop} ${nestedProp}`,
      "ui:placeholder": "auto",
      "ui:emptyValue": "auto"
    };
    const formData = fieldDef.scale ? fieldDef.scale.type : 'auto';
    return (
      <div styleName="property-editor">
        <Form
          schema={(vlSchema as any).definitions.ScaleType} // TODO don't use any
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
    const value = result.formData;
    handleAction({
      type: SPEC_FIELD_NESTED_PROP_CHANGE,
      payload: {
        shelfId,
        prop,
        nestedProp,
        value
      }
    });
  }
}

export const PropertyEditor = CSSModules(PropertyEditorBase, styles);

