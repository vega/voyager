import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import Form from 'react-jsonschema-form';
import {debounce} from 'throttle-debounce';
import {Channel} from 'vega-lite/build/src/channel';
import {ActionHandler, SPEC_VALUE_CHANGE, SpecEncodingAction} from "../../actions";
import {ShelfId, ShelfValueDef} from "../../models";
import * as styles from './value-customizer.scss';
import {generateValueDefFormData, generateValueEditorSchema} from './value-editor-schema';

export interface ValueCustomizerProps extends ActionHandler<SpecEncodingAction> {
  shelfId: ShelfId;
  valueDef: ShelfValueDef;
}

export class ValueCustomizerBase extends React.PureComponent<ValueCustomizerProps, {}> {

  constructor(props: ValueCustomizerProps) {
    super(props);
    this.changeValue = this.changeValue.bind(this);
    this.changeValue = debounce(500, this.changeValue);
  }
  public render() {
    const {shelfId, valueDef} = this.props;
    const formData = generateValueDefFormData(shelfId, valueDef) || {};
    const {schema, uiSchema} = generateValueEditorSchema(shelfId.channel as Channel);
    return (
      <div styleName="value-customizer">
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          onChange={this.changeValue}
        >
          <button type="reset" onClick={this.changeValue}>Reset</button>
          <button type="submit" style={{display: 'none'}}>Submit</button>
        </Form>
      </div>
    );
  }

  protected resetValue() {
    // read default values of mark from VL
    // Then call SPEC_VALUE_CHANGE with the corresponding valueDef
  }

  protected changeValue(result: any) {
    const value = result.formData ? result.formData[Object.keys(result.formData)[0]] : undefined;
    const {shelfId, handleAction} = this.props;
    const valueDef: ShelfValueDef = {value};

    handleAction({
      type: SPEC_VALUE_CHANGE,
      payload: {
        shelfId,
        valueDef
      }
    });
  }
}

export const ValueCustomizer = CSSModules(ValueCustomizerBase, styles);
