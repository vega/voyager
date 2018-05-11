import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import Form from 'react-jsonschema-form';
import {debounce} from 'throttle-debounce';
import {Channel} from 'vega-lite/build/src/channel';
import {ActionHandler} from '../../actions';
import {SPEC_FIELD_NESTED_PROP_CHANGE, SPEC_FIELD_PROP_CHANGE, SpecEncodingAction} from '../../actions/shelf';
import {isWildcardChannelId, ShelfFieldDef, ShelfId} from '../../models/shelf/spec';
import {generateFormData, generatePropertyEditorSchema, isContinuous} from './property-editor-schema';
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
    const {prop, nestedProp, propTab, shelfId, fieldDef} = this.props;
    if (!isWildcardChannelId(shelfId)) {
      const {schema, uiSchema} = generatePropertyEditorSchema(prop, nestedProp, propTab, fieldDef,
        shelfId.channel as Channel);
      const formData = generateFormData(shelfId, fieldDef);
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
  }

  protected changeFieldProperty(result: any) {
    const {prop, nestedProp, shelfId, handleAction} = this.props;
    const value = this.parseFormDataResult(result.formData[Object.keys(result.formData)[0]]);
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

  private parseFormDataResult(result: string) {
    const {fieldDef, prop, nestedProp} = this.props;
    const reg = /\s*,\s*/; // regex for parsing comma delimited strings
    if (result === '') {
      return undefined;
    }
    if (prop === 'scale') {
      if (nestedProp === 'range') {
        const range = result.split(reg);
        if (isContinuous(fieldDef) && range.length !== 2) {
          throw new Error('Invalid format for range. Must follow format: Min Number, Max Number');
        }
        return result === '' ? undefined : range;
      } else if (nestedProp === 'domain') {
        const domain = result.split(reg);
        if (fieldDef.type === ExpandedType.QUANTITATIVE && domain.length !== 2) {
          throw new Error('Invalid format for domain. Must follow format: Min Number, Max Number');
        } else if (fieldDef.type === ExpandedType.TEMPORAL) {
          // TODO: Not supported yet
          throw new Error('Voyager does not currently support temporal domain values');
        }
        return result === '' ? undefined : domain;
      }
    }

    // if form data is empty, default to auto suggested view, which is ? in compass
    return result === '' ? undefined : result;
  }

}

export const PropertyEditor = CSSModules(PropertyEditorBase, styles);
